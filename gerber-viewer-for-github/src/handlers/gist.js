// Gist handler: when the user is viewing a Gist that contains Gerber or
// drill files, render a preview panel above the standard Gist UI. Single
// Gerber files get a Layer view; multi-file Gists get a Top/Bottom
// composite via the stackup pipeline.

import { fetchGist } from '../core/github.js'
import {
  looksLikeGerberByName,
  looksLikeGerberByContent,
} from '../core/detect.js'
import { renderSingleLayer, buildStackup, stackupSvgs } from '../core/render.js'
import { makePanel } from '../core/panel.js'
import { fromThrown, detectionError } from '../core/errors.js'
import { findInsertionTarget as sharedFindInsertionTarget } from '../core/insertion.js'
import { logActivation, logError, logFilesLoaded, logRender } from '../core/eventlog.js'

function findInsertionTarget() {
  return sharedFindInsertionTarget('gist')
}

export async function handleGist(info, ctx = {}) {
  if (info.kind !== 'gist') return false
  if (document.querySelector('[data-ghgv="1"]')) return true

  logActivation({ url: window.location.href, kind: 'gist', filename: info.gistId })

  let gist
  try {
    gist = await fetchGist(info.gistId)
  } catch (e) {
    // Pre-panel: don't mount anything if we can't load the gist metadata.
    logError(fromThrown(e, { url: window.location.href }))
    return false
  }

  // Walk the files in the gist and identify Gerber candidates.
  const allFiles = Object.values(gist.files || {})
  if (allFiles.length === 0) return false

  // Two-pass detection: first by filename, then content-sniff to eliminate
  // false positives. The Gist API returns file content inline for files
  // under ~1MB; for larger files we'd need to fetch raw_url, but that's
  // rare for individual Gerber files.
  const candidates = []
  for (const f of allFiles) {
    if (!f.filename) continue
    if (!looksLikeGerberByName(f.filename)) continue
    if (typeof f.content !== 'string') continue
    if (!looksLikeGerberByContent(f.content)) continue
    candidates.push({ filename: f.filename, content: f.content })
  }

  if (candidates.length === 0) return false  // not a Gerber-bearing gist; bail silently

  const panel = makePanel({
    filename: gist.description || info.gistId,
    kind: 'gist',
    layerInfo: null,
    mode: candidates.length === 1 ? 'blob' : 'tree',
    settings: ctx.settings,
  })
  const target = findInsertionTarget()
  target.insertBefore(panel.panel, target.firstChild)

  if (candidates.length === 1) {
    // Single file: render as Layer view, like a blob page.
    try {
      const svg = await renderSingleLayer(candidates[0].content, false)
      panel.setLayerSvg(svg)
      panel.setStatus(`Single Gerber file: ${candidates[0].filename}`)
      logRender({ view: 'layer', layerCount: 1 })
    } catch (e) {
      const err = fromThrown(e, { filename: candidates[0].filename })
      logError(err)
      panel.setError(err)
    }
    return true
  }

  // Multi-file: build stackup.
  panel.showLoading(`Found ${candidates.length} Gerber files. Building composite...`)
  let result
  try {
    result = await buildStackup(candidates, { colorPreset: ctx.settings?.defaultColor })
  } catch (e) {
    const err = fromThrown(e)
    logError(err)
    panel.setError(err)
    return true
  }
  if (!result || !result.stackup) {
    const err = detectionError({ reason: result?.reason })
    logError(err)
    panel.setError(err)
    return true
  }

  panel.enableStackup({
    withOutline: stackupSvgs(result.stackup),
    noOutline: stackupSvgs(result.stackupNoOutline),
    layerCount: result.layerCount,
    hasOutline: result.hasOutline,
    autoShow: true,
    onColorRebuild: async (presetId) => {
      const rebuilt = await buildStackup(candidates, { colorPreset: presetId })
      return {
        withOutline: stackupSvgs(rebuilt.stackup),
        noOutline: stackupSvgs(rebuilt.stackupNoOutline),
      }
    },
  })
  logFilesLoaded({ count: result.layerCount, source: 'gist' })
  if (result.innerLayers && result.innerLayers.length > 0) {
    panel.setInnerLayers(result.innerLayers)
  }
  return true
}
