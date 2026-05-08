// Gerber Viewer for GitHub - content script entry point.
// v0.7 adds tree-view detection and ZIP archive support alongside the
// existing blob-page handler.

import { parseGitHubUrl } from './core/github.js'
import { isZipFilename } from './core/detect.js'
import { handleBlob } from './handlers/blob.js'
import { handleTree } from './handlers/tree.js'
import { handleZip } from './handlers/zip.js'

async function activate() {
  const info = parseGitHubUrl(window.location.pathname)
  if (!info) return

  if (info.kind === 'blob') {
    if (isZipFilename(info.filename)) {
      await handleZip(info)
    } else {
      await handleBlob(info)
    }
  } else if (info.kind === 'tree') {
    await handleTree(info)
  }
}

let lastUrl = location.href
function watchNavigation() {
  const obs = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href
      setTimeout(activate, 100)
    }
  })
  obs.observe(document.body, { childList: true, subtree: true })

  document.addEventListener('turbo:render', () => setTimeout(activate, 100))
  document.addEventListener('turbo:load', () => setTimeout(activate, 100))
  window.addEventListener('popstate', () => setTimeout(activate, 100))
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    activate()
    watchNavigation()
  })
} else {
  activate()
  watchNavigation()
}
