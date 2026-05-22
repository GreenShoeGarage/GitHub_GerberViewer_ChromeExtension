// Tree-page handler: when the user is viewing a folder, check if it contains
// a recognizable layer set, and if so render Top/Bottom composite views.

import {
  looksLikeGerberByName,
  looksLikeGerberByContent,
} from '../core/detect.js'
import {
  fetchRaw,
  fetchDirListing,
  fetchDefaultBranch,
} from '../core/github.js'
import { buildStackup, stackupSvgs } from '../core/render.js'
import { makePanel } from '../core/panel.js'
import { fromThrown, detectionError } from '../core/errors.js'
import { logActivation, logError, logFilesLoaded } from '../core/eventlog.js'
import { mountBomPanel } from '../core/bom-mount.js'
import { isBomFilename } from '../core/bom.js'

const treeCache = new Map()

function findInsertionTarget() {
  // GitHub folder views have shifted DOM over time. Try a series of fallbacks.
  const reactRoot = document.querySelector('react-app[app-name="react-code-view"]')
  if (reactRoot) return reactRoot
  // Classic file-listing container
  const fileListing = document.querySelector('.repository-content .Box.mb-3')
    || document.querySelector('.repository-content .Box')
    || document.querySelector('.repository-content')
  if (fileListing) return fileListing
  return document.querySelector('main') || document.body
}

export async function handleTree(info, ctx = {}) {
  if (document.querySelector('[data-ghgv="1"]')) return true

  // If the URL didn't include a ref (repo-root view), resolve it
  let ref = info.ref
  if (!ref) {
    try {
      ref = await fetchDefaultBranch(info)
    } catch (e) {
      // Repo-root pages are common, so silent failure here is correct
      // unless we want to spam errors on every repo page.
      logError(fromThrown(e, { url: window.location.href }))
      return false
    }
  }
  const fullInfo = { ...info, ref }

  // Cache key: per-folder
  const cacheKey = `${fullInfo.owner}/${fullInfo.repo}/${fullInfo.ref}/${fullInfo.dir}`

  let items
  try {
    items = await fetchDirListing(fullInfo)
  } catch (e) {
    logError(fromThrown(e, { url: window.location.href }))
    return false
  }

  const candidates = items.filter((item) =>
    item.type === 'file' &&
    item.size > 200 &&
    looksLikeGerberByName(item.name)
  )

  // Be conservative: don't render unless there are clearly multiple layers.
  // A folder with one stray .txt that happens to match wouldn't qualify.
  if (candidates.length < 3) return false

  const folderName = fullInfo.dir
    ? fullInfo.dir.split('/').pop()
    : fullInfo.repo

  const panel = makePanel({
    filename: folderName,
    kind: 'folder',
    layerInfo: null,
    mode: 'tree',
    settings: ctx.settings,
  })
  const target = findInsertionTarget()
  target.insertBefore(panel.panel, target.firstChild)
  logActivation({ url: window.location.href, kind: 'tree', filename: fullInfo.dir })
  panel.showLoading(`Found ${candidates.length} Gerber-shaped files. Loading...`)

  // Use the cache if we've already built this folder's stackup
  let result
  if (treeCache.has(cacheKey)) {
    try {
      result = await treeCache.get(cacheKey)
    } catch (e) {
      treeCache.delete(cacheKey)
      result = null
    }
  }

  if (!result) {
    const task = (async () => {
      const fetched = await Promise.all(
        candidates.map(async (item) => {
          try {
            const text = await fetchRaw(item.download_url)
            if (!looksLikeGerberByContent(text)) return null
            return { filename: item.name, content: text }
          } catch (e) {
            logError(fromThrown(e, { filename: item.name, url: item.download_url }))
            return null
          }
        })
      )
      const valid = fetched.filter(Boolean)
      if (valid.length < 2) {
        return { stackup: null, reason: 'fewer than 2 layers passed content sniff' }
      }
      const built = await buildStackup(valid, { colorPreset: ctx.settings?.defaultColor })
      // Keep the validated layer files on the result so the color rebuilder
      // can re-run the stackup with a different soldermask without re-fetching.
      return { ...built, validFiles: valid }
    })()
    treeCache.set(cacheKey, task)
    try {
      result = await task
      treeCache.set(cacheKey, Promise.resolve(result))
    } catch (e) {
      treeCache.delete(cacheKey)
      const err = fromThrown(e)
      logError(err)
      panel.setError(err)
      return true
    }
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
    onColorRebuild: result.validFiles
      ? async (presetId) => {
          const rebuilt = await buildStackup(result.validFiles, { colorPreset: presetId })
          return {
            withOutline: stackupSvgs(rebuilt.stackup),
            noOutline: stackupSvgs(rebuilt.stackupNoOutline),
          }
        }
      : null,
  })
  logFilesLoaded({ count: result.layerCount, source: 'tree' })
  if (result.innerLayers && result.innerLayers.length > 0) {
    panel.setInnerLayers(result.innerLayers)
  }

  // BOM detection: scan the directory listing for any BOM-shaped filename
  // and mount a table panel below the Gerber panel if found.
  const bomFiles = items
    .filter((item) => item.type === 'file' && isBomFilename(item.name))
    .map((item) => ({
      filename: item.name,
      getContent: async () => {
        const res = await fetch(item.download_url, { credentials: 'omit' })
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
        return res.text()
      },
      getBytes: async () => {
        const res = await fetch(item.download_url, { credentials: 'omit' })
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
        return res.arrayBuffer()
      },
    }))
  if (bomFiles.length > 0) {
    await mountBomPanel(bomFiles, panel.panel)
  }
  return true
}
