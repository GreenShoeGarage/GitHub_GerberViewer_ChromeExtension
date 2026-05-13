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

export async function handleZip(info) {
  if (!isZipFilename(info.filename)) return false
  if (document.querySelector('[data-ghgv="1"]')) return true

  const cacheKey = info.rawUrl
  const panel = makePanel({
    filename: info.filename,
    kind: 'zip',
    layerInfo: null,
    mode: 'tree',
  })
  const target = findInsertionTarget()
  target.insertBefore(panel.panel, target.firstChild)
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
          console.warn('[gerber-gh] zip entry decode failed for', name, err)
        }
      }

      if (valid.length < 2) {
        return { stackup: null, reason: 'fewer than 2 layers passed content sniff' }
      }
      return buildStackup(valid)
    })()
    zipCache.set(cacheKey, task)
    try {
      result = await task
      zipCache.set(cacheKey, Promise.resolve(result))
    } catch (e) {
      zipCache.delete(cacheKey)
      console.warn('[gerber-gh] zip processing failed', e)
      panel.setError(`Archive failed: ${e.message || e}`)
      return true
    }
  }

  if (!result || !result.stackup) {
    panel.setError(result?.reason
      ? `Not a renderable Gerber archive (${result.reason})`
      : 'Not a renderable Gerber archive')
    return true
  }

  panel.enableStackup({
    withOutline: stackupSvgs(result.stackup),
    noOutline: stackupSvgs(result.stackupNoOutline),
    layerCount: result.layerCount,
    hasOutline: result.hasOutline,
    autoShow: true,
  })
  if (result.innerLayers && result.innerLayers.length > 0) {
    panel.setInnerLayers(result.innerLayers)
  }
  return true
}
