// Options page logic. Runs in its own extension context (chrome-extension://...
// URL) so we cannot import from src/ directly because the build only
// bundles the content script. We talk to chrome.storage directly here.

const STORAGE_KEY = 'ghgv_settings'
const EVENTS_KEY = 'ghgv_events'

const DEFAULTS = {
  defaultUnit: 'mm',
  defaultInvert: false,
  defaultOutline: true,
  defaultColor: 'green',
  startCollapsed: false,
  maxApiCalls: 0,
}

// Read current settings, populate the form, and wire up change handlers
// that persist on every change (no Save button needed).
async function init() {
  // Version line from manifest
  try {
    const m = chrome.runtime.getManifest()
    document.getElementById('version-line').textContent = `Version ${m.version}`
    // Repo link, if set in the manifest's homepage_url
    if (m.homepage_url) {
      document.getElementById('repo-link').href = m.homepage_url
    }
  } catch (e) {
    // chrome.runtime.getManifest may not be available in non-extension preview
  }

  const stored = await new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (r) => resolve(r?.[STORAGE_KEY] || {}))
  })
  const current = { ...DEFAULTS, ...stored }

  // Populate form fields. Boolean fields use string values in <select>.
  document.getElementById('defaultUnit').value = current.defaultUnit
  document.getElementById('defaultInvert').value = String(current.defaultInvert)
  document.getElementById('defaultOutline').value = String(current.defaultOutline)
  document.getElementById('defaultColor').value = current.defaultColor
  document.getElementById('startCollapsed').value = String(current.startCollapsed)
  document.getElementById('maxApiCalls').value = String(current.maxApiCalls)

  // Wire change handlers. Persist on every change so users don't have to
  // think about saving.
  const fields = [
    { id: 'defaultUnit', parse: (v) => v },
    { id: 'defaultInvert', parse: (v) => v === 'true' },
    { id: 'defaultOutline', parse: (v) => v === 'true' },
    { id: 'defaultColor', parse: (v) => v },
    { id: 'startCollapsed', parse: (v) => v === 'true' },
    { id: 'maxApiCalls', parse: (v) => parseInt(v, 10) || 0 },
  ]
  for (const f of fields) {
    document.getElementById(f.id).addEventListener('change', async (e) => {
      const value = f.parse(e.target.value)
      await new Promise((resolve) => {
        chrome.storage.local.get([STORAGE_KEY], (r) => {
          const merged = { ...DEFAULTS, ...(r?.[STORAGE_KEY] || {}), [f.id]: value }
          chrome.storage.local.set({ [STORAGE_KEY]: merged }, resolve)
        })
      })
    })
  }

  // Reset button
  document.getElementById('resetSettings').addEventListener('click', async () => {
    await new Promise((r) => chrome.storage.local.remove([STORAGE_KEY], r))
    // Repopulate the form with defaults
    document.getElementById('defaultUnit').value = DEFAULTS.defaultUnit
    document.getElementById('defaultInvert').value = String(DEFAULTS.defaultInvert)
    document.getElementById('defaultOutline').value = String(DEFAULTS.defaultOutline)
    document.getElementById('defaultColor').value = DEFAULTS.defaultColor
    document.getElementById('startCollapsed').value = String(DEFAULTS.startCollapsed)
    document.getElementById('maxApiCalls').value = String(DEFAULTS.maxApiCalls)
    const s = document.getElementById('resetStatus')
    s.textContent = 'Reset complete'
    setTimeout(() => { s.textContent = '' }, 2500)
  })

  // Diagnostics button
  document.getElementById('copyDiag').addEventListener('click', async () => {
    const blob = await buildDiagnosticBlob()
    try {
      await navigator.clipboard.writeText(blob)
      const s = document.getElementById('copyStatus')
      s.textContent = 'Copied to clipboard'
      setTimeout(() => { s.textContent = '' }, 2500)
    } catch (e) {
      const s = document.getElementById('copyStatus')
      s.textContent = `Copy failed: ${e.message}`
    }
  })
}

async function buildDiagnosticBlob() {
  const manifest = (() => {
    try { return chrome.runtime.getManifest() } catch (e) { return {} }
  })()
  const events = await new Promise((resolve) => {
    if (chrome.storage?.local) {
      chrome.storage.local.get([EVENTS_KEY], (r) => resolve(r?.[EVENTS_KEY] || []))
    } else {
      resolve([])
    }
  })
  const blob = {
    extension: 'Gerber Viewer for GitHub',
    version: manifest.version || 'unknown',
    userAgent: navigator.userAgent,
    capturedAt: new Date().toISOString(),
    eventCount: events.length,
    events,
  }
  return JSON.stringify(blob, null, 2)
}

init()
