// In-memory event log for diagnostics. Purely local: nothing is sent
// anywhere. The log is the source of data for the "Copy diagnostics"
// button on the options page.
//
// The log captures both successful events (so a diagnostics paste includes
// what the user was doing) and error events (so it includes what went
// wrong). It is a fixed-size ring buffer to bound memory; the practical
// effect is that the most recent ~50 events are always available, which is
// plenty to reconstruct one or two failed sessions.
//
// We expose the log via document.documentElement.dataset.ghgvEventLog so
// the options page (which runs in a different extension context) can read
// it. The data exchange goes through the DOM rather than chrome.storage
// because we want a real-time view, not a polled snapshot.

const MAX_EVENTS = 50
const STORAGE_KEY = 'ghgv_events'

let events = []

// Mirror to chrome.storage.local so the options page (running in a
// different extension context) can read the current state. We use the
// local area rather than session because Chrome MV3 restricts content
// script access to chrome.storage.session by default (it requires an
// explicit setAccessLevel call from a service worker). Storing the
// event log in local doesn't actually persist it meaningfully since
// it's bounded by MAX_EVENTS and overwritten on every page-load, but
// the writes succeed without needing a background worker.
function syncToStorage() {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set({ [STORAGE_KEY]: events })
    }
  } catch (e) {
    // Some contexts (e.g. tests with chrome partially mocked) won't have
    // chrome.storage.local. Silent failure is fine.
  }
}

function push(type, payload) {
  const entry = {
    type,
    timestamp: Date.now(),
    timestampIso: new Date().toISOString(),
    ...payload,
  }
  events.push(entry)
  if (events.length > MAX_EVENTS) {
    events.splice(0, events.length - MAX_EVENTS)
  }
  // Also mirror to console at the appropriate level for live debugging
  if (type === 'error') {
    console.warn('[gerber-gh]', payload.summary || 'error', payload)
  }
  syncToStorage()
}

// Public logging functions for handlers and core modules to call.
export function logActivation({ url, kind, filename }) {
  push('activate', { url, kind, filename })
}

export function logFilesLoaded({ count, source }) {
  push('files-loaded', { count, source })
}

export function logRender({ view, layerCount }) {
  push('render', { view, layerCount })
}

export function logError(structuredError) {
  push('error', {
    category: structuredError.category,
    summary: structuredError.summary,
    detail: structuredError.detail,
    originalMessage: structuredError.originalError?.message,
  })
}

export function logInfo(message, extras) {
  push('info', { message, ...(extras || {}) })
}

// Snapshot accessors used by the diagnostics export.
export function getEvents() {
  return [...events]
}

export function clearEvents() {
  events = []
}

// Build the full diagnostic blob. This is what gets copied to the
// clipboard when the user clicks "Copy diagnostics" on the options page.
// Format: JSON with a small human-readable preamble so a user can
// understand it without parsing.
export function buildDiagnosticBlob({ version, userAgent } = {}) {
  const blob = {
    extension: 'Gerber Viewer for GitHub',
    version: version || 'unknown',
    userAgent: userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'),
    capturedAt: new Date().toISOString(),
    eventCount: events.length,
    events: getEvents(),
  }
  return JSON.stringify(blob, null, 2)
}
