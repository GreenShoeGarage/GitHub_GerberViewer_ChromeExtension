// Blob-page handler: when the user is viewing a single Gerber/drill file,
// render it as the Layer view and asynchronously fetch siblings to populate
// Top/Bottom multi-layer views.

import whatsThatGerber from 'whats-that-gerber'
import {
  looksLikeGerberByName,
  looksLikeGerberByContent,
  sniffFiletype,
  isAmbiguousExtension,
} from '../core/detect.js'
import { fetchRaw, fetchDirListing } from '../core/github.js'
import { renderSingleLayer, buildStackup, stackupSvgs } from '../core/render.js'
import { makePanel } from '../core/panel.js'
import { parseX2Attributes, summarizeAttributes } from '../core/x2attr.js'

// Module-scoped cache for sibling-fetch results, keyed by repo+ref+dir.
const stackupCache = new Map()

async function loadSiblings(info) {
  const cacheKey = `${info.owner}/${info.repo}/${info.ref}/${info.dir}`
  if (stackupCache.has(cacheKey)) {
    return stackupCache.get(cacheKey)
  }

  const task = (async () => {
    const items = await fetchDirListing(info)
    const candidates = items.filter((item) =>
      item.type === 'file' &&
      item.size > 200 &&
      looksLikeGerberByName(item.name)
    )
    if (candidates.length < 2) {
      return { stackup: null, reason: 'fewer than 2 Gerber-shaped files in folder' }
    }
    const fetched = await Promise.all(
      candidates.map(async (item) => {
        try {
          const text = await fetchRaw(item.download_url)
          if (!looksLikeGerberByContent(text)) return null
          return { filename: item.name, content: text }
        } catch (e) {
          console.warn('[gerber-gh] sibling fetch failed for', item.name, e)
          return null
        }
      })
    )
    const valid = fetched.filter(Boolean)
    if (valid.length < 2) {
      return { stackup: null, reason: 'fewer than 2 layers passed content sniff' }
    }
    return buildStackup(valid)
  })()

  stackupCache.set(cacheKey, task)
  try {
    const result = await task
    stackupCache.set(cacheKey, Promise.resolve(result))
    return result
  } catch (e) {
    stackupCache.delete(cacheKey)
    throw e
  }
}

function findInsertionTarget() {
  const reactRoot = document.querySelector('react-app[app-name="react-code-view"]')
  if (reactRoot) return reactRoot
  const classicBox = document.querySelector('.repository-content .Box.mt-3.position-relative')
    || document.querySelector('.repository-content .Box.mt-3')
    || document.querySelector('.repository-content')
  if (classicBox) return classicBox
  return document.querySelector('main') || document.body
}

export async function handleBlob(info) {
  if (!looksLikeGerberByName(info.filename)) return false
  if (document.querySelector('[data-ghgv="1"]')) return true

  let text
  try {
    text = await fetchRaw(info.rawUrl)
  } catch (e) {
    console.warn('[gerber-gh] fetch failed', e)
    return false
  }

  if (isAmbiguousExtension(info.filename) && !looksLikeGerberByContent(text)) {
    return false
  }

  const layerInfo = whatsThatGerber([info.filename])[info.filename] || null
  const sniffed = sniffFiletype(text)
  const isDrill = sniffed === 'drill' || layerInfo?.type === 'drill'
  const kind = isDrill ? 'drill' : 'gerber'

  // Parse X2/X3 attributes if present. Prefer this summary over the
  // whats-that-gerber filename-based label since it reflects the file's
  // own declared role.
  const x2 = parseX2Attributes(text)
  const x2Summary = summarizeAttributes(x2)

  const panel = makePanel({
    filename: info.filename,
    kind,
    layerInfo,
    mode: 'blob',
    metaOverride: x2Summary,
  })
  const target = findInsertionTarget()
  target.insertBefore(panel.panel, target.firstChild)

  try {
    const svg = await renderSingleLayer(text, isDrill)
    panel.setLayerSvg(svg)
  } catch (e) {
    console.warn('[gerber-gh] single-layer render failed', e)
    panel.setError(`Render failed: ${e.message || e}`)
    return true
  }

  panel.setStatus('Loading sibling layers...')
  try {
    const result = await loadSiblings(info)
    if (!result || !result.stackup) {
      panel.setStatus(result?.reason
        ? `No multi-layer view (${result.reason})`
        : 'No multi-layer view available')
      return true
    }
    panel.enableStackup({
      withOutline: stackupSvgs(result.stackup),
      noOutline: stackupSvgs(result.stackupNoOutline),
      layerCount: result.layerCount,
      hasOutline: result.hasOutline,
    })
    if (result.innerLayers && result.innerLayers.length > 0) {
      panel.setInnerLayers(result.innerLayers)
    }
  } catch (e) {
    console.warn('[gerber-gh] stackup failed', e)
    panel.setStatus(`Multi-layer unavailable: ${e.message || e}`)
  }
  return true
}
