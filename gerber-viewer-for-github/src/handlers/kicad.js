// KiCad blob handler: when the user is viewing a .kicad_pcb or .kicad_sch
// file on GitHub, fetch it and feed it to KiCanvas's <kicanvas-embed>
// element. KiCanvas takes over all rendering, layer selection, zoom, and
// pan, so our panel is intentionally minimal in this mode.

import { fetchRaw } from '../core/github.js'
import { loadKiCanvas } from '../core/kicanvas-loader.js'
import { makeKiCadPanel } from '../core/kicad-panel.js'
import { fromThrown, formatTooOldError, capabilityError, createError, ErrorCategory } from '../core/errors.js'
import { logActivation, logError, logRender } from '../core/eventlog.js'
import { findInsertionTarget as sharedFindInsertionTarget } from '../core/insertion.js'

export function isKiCadPcbFilename(filename) {
  return /\.kicad_pcb$/i.test(filename || '')
}

export function isKiCadSchFilename(filename) {
  return /\.kicad_sch$/i.test(filename || '')
}

export function isKiCadFilename(filename) {
  return isKiCadPcbFilename(filename) || isKiCadSchFilename(filename)
}

// Identify which KiCanvas source-type attribute to use for a given file.
// KiCanvas expects "board" for .kicad_pcb and "schematic" for .kicad_sch.
function kiCanvasType(filename) {
  return isKiCadSchFilename(filename) ? 'schematic' : 'board'
}

// Probe WebGL2 availability cheaply. KiCanvas uses WebGL2 specifically; if
// the user's browser has WebGL disabled (some kiosk modes, certain
// hardware-accelerated rendering policies, ancient GPUs without modern
// drivers), trying to load KiCanvas just yields a black canvas and a
// library-internal error that's hard to surface back to the user. Probing
// up front lets us bail with a clean, actionable message.
function checkWebGL2() {
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('webgl2')
    if (!ctx) {
      return { ok: false, reason: 'WebGL2 is unavailable in this browser' }
    }
    // Also confirm the GL context is in a usable state. A driver crash or
    // a forced-software fallback can produce a context that exists but is
    // immediately lost.
    const lost = ctx.getExtension && ctx.getExtension('WEBGL_lose_context')
    if (ctx.isContextLost && ctx.isContextLost()) {
      return { ok: false, reason: 'WebGL2 context was lost on creation' }
    }
    return { ok: true }
  } catch (e) {
    return { ok: false, reason: `WebGL2 probe failed: ${e.message || e}` }
  }
}

function findInsertionTarget() {
  return sharedFindInsertionTarget('blob')
}

// Read a few summary fields out of the kicad_pcb file for the status line.
// KiCad's format is an S-expression; we don't need a full parser to pull
// `version`, `generator`, and (optionally) the layer count out.
function extractMetadata(text, isSchematic = false) {
  const head = text.slice(0, 4096)
  const versionMatch = head.match(/\(version\s+(\d+)/)
  const generatorMatch = head.match(/\(generator\s+"?([\w.-]+)/)

  if (isSchematic) {
    // For schematics, count component instances ("(symbol ..." entries).
    // We sample up to the first 256 KB to avoid scanning a huge document
    // while still giving an honest count for typical hierarchical designs.
    const sample = text.slice(0, 262144)
    const symbolMatches = sample.match(/\(\s*symbol\s+/g)
    const symbolCount = symbolMatches ? symbolMatches.length : null
    return {
      version: versionMatch ? versionMatch[1] : null,
      generator: generatorMatch ? generatorMatch[1] : null,
      symbolCount,
      layerCount: null,
    }
  }

  // Board: count layer entries inside the (layers ...) block.
  const layersBlock = text.match(/\(layers\s+([\s\S]+?)\n\s*\)/)
  let layerCount = null
  if (layersBlock) {
    const matches = layersBlock[1].match(/\(\d+\s+"/g)
    if (matches) layerCount = matches.length
  }
  return {
    version: versionMatch ? versionMatch[1] : null,
    generator: generatorMatch ? generatorMatch[1] : null,
    layerCount,
    symbolCount: null,
  }
}

// When WebGL2 isn't available, render an informative fallback into the
// stage: short explanation, parsed file metadata, and a link to the raw
// file on GitHub so the user can at least download it. We don't load
// KiCanvas at all in this path.
function showWebGLFallback(panel, info, meta, reason, kind = 'board') {
  const stage = panel.stage
  stage.innerHTML = ''
  stage.classList.remove('ghgv-stage-kicad')

  const isSchematic = kind === 'schematic'

  const wrap = document.createElement('div')
  wrap.style.padding = '24px 16px'
  wrap.style.maxWidth = '640px'
  wrap.style.margin = '0 auto'
  wrap.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  wrap.style.fontSize = '13px'
  wrap.style.color = 'var(--fgColor-default, #1f2328)'

  const heading = document.createElement('div')
  heading.style.fontWeight = '600'
  heading.style.marginBottom = '8px'
  heading.textContent = isSchematic ? 'KiCad schematic preview unavailable' : 'KiCad PCB preview unavailable'
  wrap.appendChild(heading)

  const explain = document.createElement('p')
  explain.style.margin = '0 0 12px 0'
  explain.style.lineHeight = '1.5'
  explain.textContent =
    `This file requires WebGL2 to render and your browser reports it as ` +
    `unavailable. ${reason}. WebGL2 may be disabled in your browser ` +
    `settings, blocked by enterprise policy, or unsupported by your GPU drivers.`
  wrap.appendChild(explain)

  if (meta.layerCount || meta.symbolCount || meta.generator || meta.version) {
    const metaList = document.createElement('div')
    metaList.style.margin = '0 0 12px 0'
    metaList.style.padding = '8px 12px'
    metaList.style.background = 'var(--bgColor-default, #ffffff)'
    metaList.style.border = '1px solid var(--borderColor-default, #d0d7de)'
    metaList.style.borderRadius = '6px'
    metaList.style.fontFamily = 'ui-monospace, SFMono-Regular, monospace'
    metaList.style.fontSize = '12px'
    const lines = []
    if (isSchematic) {
      if (meta.symbolCount) lines.push(`Symbols: ${meta.symbolCount}`)
    } else {
      if (meta.layerCount) lines.push(`Layers: ${meta.layerCount}`)
    }
    if (meta.generator) lines.push(`Generator: ${meta.generator}`)
    if (meta.version) lines.push(`Format version: ${meta.version}`)
    metaList.textContent = lines.join(' \u2022 ')
    wrap.appendChild(metaList)
  }

  const linkPara = document.createElement('p')
  linkPara.style.margin = '0'
  const link = document.createElement('a')
  link.href = info.rawUrl
  link.target = '_blank'
  link.rel = 'noopener noreferrer'
  link.textContent = isSchematic
    ? 'Download the raw .kicad_sch file'
    : 'Download the raw .kicad_pcb file'
  link.style.color = 'var(--fgColor-accent, #0969da)'
  linkPara.appendChild(link)
  linkPara.appendChild(document.createTextNode(' to open it in KiCad locally.'))
  wrap.appendChild(linkPara)

  stage.appendChild(wrap)
  panel.setStatus('WebGL2 unavailable')
}

export async function handleKiCadBlob(info, ctx = {}) {
  if (!isKiCadFilename(info.filename)) return false
  if (document.querySelector('[data-ghgv="1"]')) return true

  const isSchematic = isKiCadSchFilename(info.filename)
  const kind = isSchematic ? 'schematic' : 'board'
  const extension = isSchematic ? '.kicad_sch' : '.kicad_pcb'

  const panel = makeKiCadPanel({ filename: info.filename, kind })
  const target = findInsertionTarget()
  target.insertBefore(panel.panel, target.firstChild)
  logActivation({ url: window.location.href, kind: `kicad-${kind}`, filename: info.filename })

  let text
  panel.showLoading(`Downloading ${extension}...`)
  try {
    text = await fetchRaw(info.rawUrl)
  } catch (e) {
    const err = fromThrown(e, { filename: info.filename, rawUrl: info.rawUrl })
    logError(err)
    panel.setError(err)
    return true
  }

  // KiCanvas only handles KiCad 6+ format. Earlier versions used a
  // different layout. Sniff the version to give a helpful error.
  const meta = extractMetadata(text, isSchematic)
  if (meta.version && parseInt(meta.version, 10) < 20210000) {
    const err = formatTooOldError({
      formatVersion: meta.version,
      minVersion: '20210000 (KiCad 6+)',
      rawUrl: info.rawUrl,
    })
    logError(err)
    panel.setError(err)
    return true
  }

  // Probe WebGL2 before attempting to load KiCanvas. If it's unavailable,
  // give the user an actionable message instead of waiting for KiCanvas
  // to fail silently inside its embed.
  const gl = checkWebGL2()
  if (!gl.ok) {
    logError(capabilityError({
      summary: 'WebGL2 unavailable',
      detail: gl.reason,
      rawUrl: info.rawUrl,
    }))
    showWebGLFallback(panel, info, meta, gl.reason, kind)
    return true
  }

  panel.showLoading('Loading KiCanvas...')
  try {
    await loadKiCanvas()
    logRender({ view: `kicanvas-${kind}`, layerCount: meta.layerCount })
  } catch (e) {
    const err = createError({
      category: ErrorCategory.Capability,
      summary: 'KiCanvas could not load',
      detail: 'The bundled KiCanvas viewer failed to initialize in this page.',
      suggestion: 'This is unusual. Try reloading the page. If the problem persists, you can download the raw file using the link below and open it in KiCad locally.',
      rawUrl: info.rawUrl,
      originalError: e,
    })
    logError(err)
    panel.setError(err)
    return true
  }

  // Build the embed elements. KiCanvas reads from <kicanvas-source> children;
  // we pass the text inline as textContent. The `type` attribute tells
  // KiCanvas whether this is a board or schematic, since we're not using
  // a filename-based hint.
  panel.stage.innerHTML = ''
  const embed = document.createElement('kicanvas-embed')
  embed.setAttribute('controls', 'full')
  const source = document.createElement('kicanvas-source')
  source.setAttribute('type', kiCanvasType(info.filename))
  source.setAttribute('name', info.filename)
  // Inline source: textContent is read by KiCanvas after the element mounts
  source.textContent = text
  embed.appendChild(source)
  panel.stage.appendChild(embed)

  // Status summary
  const summary = []
  if (isSchematic) {
    if (meta.symbolCount) summary.push(`${meta.symbolCount} symbols`)
  } else {
    if (meta.layerCount) summary.push(`${meta.layerCount} layers`)
  }
  if (meta.generator) summary.push(`generator: ${meta.generator}`)
  if (meta.version) summary.push(`format v${meta.version}`)
  panel.setStatus(summary.join(' \u2022 '))
  return true
}
