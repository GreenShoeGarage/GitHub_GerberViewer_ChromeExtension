// ZIP handler: when a user opens a .zip on a GitHub blob page, fetch the
// archive bytes, extract the entries in-memory, look for Gerber/drill files,
// and render a multi-layer composite if a recognizable layer set is found.

import { unzipSync, strFromU8 } from 'fflate'
import {
  looksLikeGerberByName,
  looksLikeGerberByContent,
  isZipFilename,
} from '../core/detect.js'
import { fetchRawBytes } from '../core/github.js'
import { buildStackup, stackupSvgs } from '../core/render.js'
import { makePanel } from '../core/panel.js'
import { fromThrown, detectionError, createError, ErrorCategory } from '../core/errors.js'
import { logActivation, logError, logFilesLoaded } from '../core/eventlog.js'
import { mountBomPanel } from '../core/bom-mount.js'
import { isBomFilename } from '../core/bom.js'

const zipCache = new Map()

function findInsertionTarget() {
  const reactRoot = document.querySelector('react-app[app-name="react-code-view"]')
  if (reactRoot) return reactRoot
  const classicBox = document.querySelector('.repository-content .Box.mt-3.position-relative')
    || document.querySelector('.repository-content .Box.mt-3')
    || document.querySelector('.repository-content')
  if (classicBox) return classicBox
  return document.querySelector('main') || document.body
}

// Some zips have a single nested folder; flatten so layer detection still works.
function flattenZipNames(names) {
  if (names.length === 0) return new Map(names.map((n) => [n, n]))
  let prefix = names[0].includes('/') ? names[0].substring(0, names[0].lastIndexOf('/') + 1) : ''
  for (const name of names) {
    while (prefix && !name.startsWith(prefix)) {
      const slashIdx = prefix.slice(0, -1).lastIndexOf('/')
      prefix = slashIdx === -1 ? '' : prefix.substring(0, slashIdx + 1)
    }
    if (!prefix) break
  }
  // Map original -> flattened (basename or sub-path)
  const m = new Map()
  for (const name of names) {
    m.set(name, prefix ? name.substring(prefix.length) : name)
  }
  return m
}

export async function handleZip(info, ctx = {}) {
  if (!isZipFilename(info.filename)) return false
  if (document.querySelector('[data-ghgv="1"]')) return true

  const cacheKey = info.rawUrl
  const panel = makePanel({
    filename: info.filename,
    kind: 'zip',
    layerInfo: null,
    mode: 'tree',
    settings: ctx.settings,
  })
  const target = findInsertionTarget()
  target.insertBefore(panel.panel, target.firstChild)
  logActivation({ url: window.location.href, kind: 'zip', filename: info.filename })
  panel.showLoading('Downloading archive...')

  let result
  if (zipCache.has(cacheKey)) {
    try {
      result = await zipCache.get(cacheKey)
    } catch (e) {
      zipCache.delete(cacheKey)
      result = null
    }
  }

  if (!result) {
    const task = (async () => {
      const bytes = await fetchRawBytes(info.rawUrl)
      // fflate's unzipSync is synchronous and avoids the Promise/stream
      // pipelines that JSZip's async APIs depend on. Faster too.
      const entries = unzipSync(new Uint8Array(bytes), {
        filter: (file) => {
          const name = file.name
          if (name.endsWith('/')) return false  // directory
          if (name.includes('__MACOSX/')) return false
          if (name.split('/').pop()?.startsWith('.')) return false
          return true
        },
      })

      const allNames = Object.keys(entries)
      const flatMap = flattenZipNames(allNames)

      const candidateNames = allNames.filter((n) => {
        const flat = flatMap.get(n)
        return looksLikeGerberByName(flat.split('/').pop())
      })

      if (candidateNames.length < 3) {
        return { stackup: null, reason: `archive has ${candidateNames.length} Gerber-shaped files` }
      }

      const valid = []
      for (const name of candidateNames) {
        try {
          const u8 = entries[name]
          const text = strFromU8(u8)
          if (!looksLikeGerberByContent(text)) continue
          const flat = flatMap.get(name)
          valid.push({ filename: flat.split('/').pop(), content: text })
        } catch (err) {
          logError(createError({
            category: ErrorCategory.Parse,
            summary: 'ZIP entry could not be decoded',
            detail: `Could not extract or decode ${name}.`,
            originalError: err,
          }))
        }
      }

      // Also identify BOM-shaped entries while we have the listing in
      // hand. We decode them only when the BOM panel mount actually asks
      // (via getContent) to avoid spending CPU on potentially-large CSVs
      // that the mount might decline to render.
      const bomEntries = allNames
        .filter((name) => isBomFilename(name.split('/').pop()))
        .map((name) => ({
          filename: name.split('/').pop(),
          getContent: async () => strFromU8(entries[name]),
          getBytes: async () => {
            // Copy into a fresh ArrayBuffer so SheetJS doesn't accidentally
            // mutate the cached entry's view. The slice is cheap and the
            // safety is worth it.
            const view = entries[name]
            return view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength)
          },
        }))

      if (valid.length < 2) {
        return { stackup: null, reason: 'fewer than 2 layers passed content sniff', bomEntries }
      }
      const stackup = await buildStackup(valid)
      return { ...stackup, bomEntries }
    })()
    zipCache.set(cacheKey, task)
    try {
      result = await task
      zipCache.set(cacheKey, Promise.resolve(result))
    } catch (e) {
      zipCache.delete(cacheKey)
      const err = fromThrown(e, { filename: info.filename, rawUrl: info.rawUrl })
      // Override the summary because users care that the archive failed,
      // not that "render failed".
      const archiveErr = createError({
        category: err.category,
        summary: 'Archive could not be processed',
        detail: `An error occurred while extracting or parsing ${info.filename}.`,
        suggestion: 'The archive may be corrupted, password-protected, or in an unsupported format. You can download the raw ZIP using the link below.',
        rawUrl: info.rawUrl,
        originalError: e,
      })
      logError(archiveErr)
      panel.setError(archiveErr)
      return true
    }
  }

  if (!result || !result.stackup) {
    const err = createError({
      category: ErrorCategory.Detection,
      summary: 'Not a renderable PCB archive',
      detail: result?.reason
        ? `This archive does not appear to contain a renderable Gerber layer set: ${result.reason}.`
        : 'This archive does not appear to contain a renderable Gerber layer set.',
      suggestion: 'The extension looks for ZIP archives that contain at least 3 Gerber-shaped files. If this archive is meant to be a Gerber package, it may use unusual filenames; you can download the raw archive using the link below.',
      rawUrl: info.rawUrl,
    })
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
  })
  logFilesLoaded({ count: result.layerCount, source: 'zip' })
  if (result.innerLayers && result.innerLayers.length > 0) {
    panel.setInnerLayers(result.innerLayers)
  }
  if (result.bomEntries && result.bomEntries.length > 0) {
    await mountBomPanel(result.bomEntries, panel.panel)
  }
  return true
}
