// Gerber Viewer for GitHub - content script entry point.
// v0.9 adds settings-driven defaults, structured error handling, and
// diagnostics via an options page.

import { parseGitHubUrl } from './core/github.js'
import { isZipFilename } from './core/detect.js'
import { handleBlob } from './handlers/blob.js'
import { handleTree } from './handlers/tree.js'
import { handleZip } from './handlers/zip.js'
import { handleKiCadBlob, isKiCadFilename } from './handlers/kicad.js'
import { handleGist } from './handlers/gist.js'
import { handlePull } from './handlers/pull.js'
import { load as loadSettings } from './core/settings.js'

// Settings cache: loaded once at startup, refreshed on every activate
// call so SPA-style nav picks up dashboard changes without a reload.
let currentSettings = null

// Activation serializer.
//
// The problem: every handler checks a [data-ghgv="1"] guard at its top,
// then does async work (fetch default branch, fetch dir listing, etc.)
// before finally creating the panel and setting that marker. In between,
// other navigation events (turbo:render, turbo:load, popstate, or the
// MutationObserver in watchNavigation) can fire activate() again. The
// second run's guard check still finds nothing, because the first run
// has not yet reached makePanel(). Both runs then create panels, and the
// user sees the preview and the BOM listing rendered twice.
//
// The fix: serialize activate() at the dispatcher. Only one activation
// runs at a time. A second call that arrives while one is in progress is
// coalesced: we remember at most one pending activation and run it after
// the current one settles, so real navigation to a new URL still gets
// its own activation but a burst of duplicate triggers for the same URL
// collapses to a single run.
let activationInProgress = false
let pendingActivation = false

async function activate() {
  if (activationInProgress) {
    // Coalesce: mark that another activation is wanted after this one
    // finishes. Multiple duplicate triggers collapse into one pending run.
    pendingActivation = true
    return
  }
  activationInProgress = true
  try {
    await runActivate()
  } finally {
    activationInProgress = false
    if (pendingActivation) {
      pendingActivation = false
      // Defer to a fresh task so any DOM changes from the just-finished
      // run are settled before the next one inspects the page. Without
      // this, the follow-up activation could observe a half-mounted state.
      setTimeout(activate, 0)
    }
  }
}

async function runActivate() {
  // Clear any panels left over from a previous URL. If the user navigated
  // SPA-style from one page to another while an activation was in flight,
  // a panel tagged with the old URL may still be in the DOM. Removing it
  // now stops the next handler's mount-guard from mistaking the stale
  // panel for its own, which would leave the user stuck on the wrong view.
  //
  // Compare by origin + pathname only. GitHub updates the URL fragment
  // (#L34, #diff-...) and query string on in-page interactions like
  // clicking a line number, and popstate fires for those too. Those are
  // still the same page as far as the extension is concerned, so we must
  // not evict our own panel and race-mount a replacement whose async
  // enableStackup call will land on the wrong element (which was the
  // v1.0.1 regression that broke the Outline button).
  const hereKey = window.location.origin + window.location.pathname
  document.querySelectorAll('[data-ghgv-url]').forEach((el) => {
    const stored = el.getAttribute('data-ghgv-url')
    let storedKey = stored
    try {
      const u = new URL(stored)
      storedKey = u.origin + u.pathname
    } catch (e) {
      // Legacy or malformed value: fall back to string compare.
    }
    if (storedKey !== hereKey) {
      el.remove()
    }
  })

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

  const info = parseGitHubUrl(window.location.pathname, window.location.hostname)
  if (!info) return

  const ctx = { settings: currentSettings }

  if (info.kind === 'gist') {
    await handleGist(info, ctx)
  } else if (info.kind === 'pull') {
    await handlePull(info, ctx)
  } else if (info.kind === 'blob') {
    if (isKiCadFilename(info.filename)) {
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
