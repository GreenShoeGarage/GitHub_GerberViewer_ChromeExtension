// Centralized error handling for the extension. Every user-visible failure
// goes through createError() to get a consistent shape:
//
//   { category, summary, detail, suggestion, rawUrl, originalError }
//
// The panel renders these via renderError() with a heading, a short
// human-readable explanation, a suggested next step, and (where applicable)
// a "View raw file" link as a fallback. The event log captures the full
// structured form for the diagnostics blob.
//
// Categories are intentionally coarse. The point is to give the user one
// of a handful of mental models for what went wrong, not to enumerate
// every possible failure cause.

export const ErrorCategory = {
  Network: 'network',
  Parse: 'parse',
  FormatTooOld: 'format-too-old',
  Capability: 'capability',
  Detection: 'detection',
  Render: 'render',
  Unknown: 'unknown',
}

// Build a structured error object. Use this everywhere we'd otherwise
// throw a string or set panel.setError(`Foo failed: ${e.message}`).
export function createError({ category, summary, detail, suggestion, rawUrl, originalError }) {
  return {
    category: category || ErrorCategory.Unknown,
    summary: summary || 'Something went wrong',
    detail: detail || null,
    suggestion: suggestion || null,
    rawUrl: rawUrl || null,
    originalError: originalError || null,
    timestamp: Date.now(),
  }
}

// Convenience constructors for the common cases. These exist so handlers
// don't have to remember the exact wording of every error; they pass in
// the contextual bits and we produce a consistent presentation.

export function networkError({ status, url, rawUrl, originalError }) {
  let summary, suggestion
  if (status === 404) {
    summary = 'File not found'
    suggestion = 'The repository may be private, or the file may have been moved or deleted.'
  } else if (status === 403) {
    summary = 'Access denied'
    suggestion = 'You may have hit the GitHub API rate limit (60 requests/hour without authentication). Try again in a few minutes.'
  } else if (status >= 500) {
    summary = 'GitHub is having trouble'
    suggestion = 'This is a server-side problem at GitHub, not in the extension. Try refreshing the page in a minute.'
  } else if (!status) {
    summary = 'Could not reach GitHub'
    suggestion = 'Check your internet connection, or your browser may be blocking the request.'
  } else {
    summary = `Network error (HTTP ${status})`
    suggestion = 'Try refreshing the page.'
  }
  return createError({
    category: ErrorCategory.Network,
    summary,
    detail: url ? `Failed to fetch: ${url}` : null,
    suggestion,
    rawUrl,
    originalError,
  })
}

export function parseError({ filename, rawUrl, originalError }) {
  return createError({
    category: ErrorCategory.Parse,
    summary: 'Could not parse this file',
    detail: filename
      ? `The file ${filename} could not be interpreted as Gerber, Excellon drill, or KiCad PCB data.`
      : 'The file could not be interpreted as a known PCB format.',
    suggestion: 'This usually means the file uses a format variant we do not handle yet, or the file is corrupted. You can view the raw contents at the link below, and reporting the file would help us improve coverage.',
    rawUrl,
    originalError,
  })
}

export function formatTooOldError({ formatVersion, minVersion, rawUrl }) {
  return createError({
    category: ErrorCategory.FormatTooOld,
    summary: 'File format too old',
    detail: formatVersion && minVersion
      ? `This KiCad file declares format version ${formatVersion}, but KiCanvas requires ${minVersion} or newer.`
      : 'This KiCad file uses an older format that the embedded viewer cannot render.',
    suggestion: 'You can download the raw file using the link below and open it in KiCad locally.',
    rawUrl,
  })
}

export function capabilityError({ summary, detail, suggestion, rawUrl }) {
  return createError({
    category: ErrorCategory.Capability,
    summary: summary || 'Browser capability unavailable',
    detail,
    suggestion,
    rawUrl,
  })
}

export function detectionError({ reason, rawUrl }) {
  return createError({
    category: ErrorCategory.Detection,
    summary: 'No PCB layer set detected',
    detail: reason || 'The folder does not contain enough recognizable Gerber files to build a multi-layer view.',
    suggestion: 'Open an individual Gerber file to see it rendered on its own, or navigate to a folder that contains a full layer set (typically 3 or more Gerber files plus a drill file).',
    rawUrl,
  })
}

export function renderError({ filename, rawUrl, originalError }) {
  return createError({
    category: ErrorCategory.Render,
    summary: 'Render failed',
    detail: filename
      ? `Rendering ${filename} produced an internal error.`
      : 'An internal error occurred while rendering the preview.',
    suggestion: 'You can view the raw file using the link below. Reporting the failure would help us track down the cause.',
    rawUrl,
    originalError,
  })
}

// Distinguish a fetch failure from a parse failure when we only have a
// thrown Error object. The fetch helpers in core/github.js throw errors
// shaped like "Fetch failed: 404" so we can extract the status code.
export function fromThrown(e, { url, filename, rawUrl } = {}) {
  // GitHub helpers throw errors shaped like "Fetch failed: 404" or
  // "Directory listing failed: 404"; both encode an HTTP status we can
  // turn into a meaningful networkError.
  if (e instanceof Error) {
    const m = e.message.match(/(?:Fetch failed|Directory listing failed): (\d+)/)
    if (m) {
      const status = parseInt(m[1], 10)
      return networkError({ status, url, rawUrl, originalError: e })
    }
    if (/parse|invalid|malformed|unexpected token/i.test(e.message)) {
      return parseError({ filename, rawUrl, originalError: e })
    }
  }
  return renderError({ filename, rawUrl, originalError: e })
}
