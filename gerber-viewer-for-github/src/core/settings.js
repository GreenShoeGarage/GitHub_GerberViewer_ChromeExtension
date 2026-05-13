// User preferences persisted via chrome.storage.local. The module
// exposes defaults, a one-shot load() that returns the current settings,
// and a save() that writes a partial update. Consumers in the content
// script call load() once at startup and treat the returned object as
// readonly; the options page calls save() to persist user changes.
//
// We use chrome.storage.local (not sync) for two reasons:
//   1. The data is small and not interesting to roam across devices
//   2. It avoids the rate limit on storage.sync (120 writes/hour) which
//      could in principle be hit by an aggressive user

const STORAGE_KEY = 'ghgv_settings'

export const DEFAULTS = Object.freeze({
  // Default measurement unit when the tool is activated.
  defaultUnit: 'mm', // 'mm' | 'mil'
  // Whether to invert (dark mode) the rendered SVG by default.
  defaultInvert: false,
  // Whether the outline-from-file mode is on by default for stackup views.
  defaultOutline: true,
  // Whether to start with the panel collapsed (Show button) instead of
  // expanded (Hide button). Some users prefer to opt in per file.
  startCollapsed: false,
  // Hard cap on GitHub API calls per page-load. Useful for users on the
  // unauthenticated rate limit who want to be cautious. 0 disables.
  maxApiCalls: 0,
})

export async function load() {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) {
    return { ...DEFAULTS }
  }
  return new Promise((resolve) => {
    try {
      chrome.storage.local.get([STORAGE_KEY], (result) => {
        const stored = result?.[STORAGE_KEY] || {}
        resolve({ ...DEFAULTS, ...stored })
      })
    } catch (e) {
      resolve({ ...DEFAULTS })
    }
  })
}

export async function save(partial) {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) return
  return new Promise((resolve) => {
    try {
      chrome.storage.local.get([STORAGE_KEY], (result) => {
        const current = result?.[STORAGE_KEY] || {}
        const next = { ...current, ...partial }
        chrome.storage.local.set({ [STORAGE_KEY]: next }, () => resolve(next))
      })
    } catch (e) {
      resolve()
    }
  })
}

export async function reset() {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) return
  return new Promise((resolve) => {
    try {
      chrome.storage.local.remove([STORAGE_KEY], () => resolve())
    } catch (e) {
      resolve()
    }
  })
}
