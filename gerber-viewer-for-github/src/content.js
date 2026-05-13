// Gerber Viewer for GitHub - content script entry point.
// v0.9 adds settings-driven defaults, structured error handling, and
// diagnostics via an options page.

import { parseGitHubUrl } from './core/github.js'
import { isZipFilename } from './core/detect.js'
import { handleBlob } from './handlers/blob.js'
import { handleTree } from './handlers/tree.js'
import { handleZip } from './handlers/zip.js'
import { handleKiCadBlob, isKiCadPcbFilename } from './handlers/kicad.js'
import { load as loadSettings } from './core/settings.js'

// Settings cache: loaded once at startup, refreshed on every activate
// call so SPA-style nav picks up dashboard changes without a reload.
let currentSettings = null

async function activate() {
  // Reload settings each activation. The load() call is cheap (a single
  // chrome.storage.local.get) so doing it every time avoids stale state
  // after the user changes a setting in the options tab.
  try {
    currentSettings = await loadSettings()
  } catch (e) {
    // If settings can't load for any reason, proceed with defaults baked
    // into the settings module.
    currentSettings = null
  }

  const info = parseGitHubUrl(window.location.pathname)
  if (!info) return

  const ctx = { settings: currentSettings }

  if (info.kind === 'blob') {
    if (isKiCadPcbFilename(info.filename)) {
      await handleKiCadBlob(info, ctx)
    } else if (isZipFilename(info.filename)) {
      await handleZip(info, ctx)
    } else {
      await handleBlob(info, ctx)
    }
  } else if (info.kind === 'tree') {
    await handleTree(info, ctx)
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
