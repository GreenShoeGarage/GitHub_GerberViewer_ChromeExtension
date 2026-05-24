// Centralized insertion-target resolution.
//
// The extension inserts its preview panel into GitHub's page DOM. GitHub
// changes that DOM regularly (and A/B-tests new layouts), so a selector
// that works today can silently break later. Previously each handler had
// its own copy of this logic, which meant they drifted and each had to be
// fixed separately when a layout changed.
//
// This module:
//   1. Tries an ordered list of known-good selectors per page kind, most
//      specific first.
//   2. Falls back to `main`, then `body`, so the panel always mounts
//      somewhere rather than throwing.
//   3. Logs a diagnostic event when it has to use a fallback, so the wild
//      breakage shows up in users' "Copy diagnostics" output. That turns a
//      silent failure into a visible signal we can act on.
//
// "Visible failure" here does not mean a scary error to the user; the panel
// still renders. It means the failure is *recorded* so it is diagnosable,
// instead of vanishing.

import { logInfo } from './eventlog.js'

// Selector lists per page kind, ordered most-specific to least. When GitHub
// introduces a new layout, add its container selector to the front of the
// relevant list in one place.
const SELECTORS = {
  blob: [
    'react-app[app-name="react-code-view"]',
    '.repository-content .Box.mt-3.position-relative',
    '.repository-content .Box.mt-3',
    '.repository-content',
  ],
  tree: [
    'react-app[app-name="react-code-view"]',
    '.repository-content .Box.mb-3',
    '.repository-content .Box',
    '.repository-content',
  ],
  gist: [
    '.repository-content',
    '.gist-content',
    '#gist-pjax-container',
  ],
  // Pull request "Files changed" tab. The per-file diff container is what
  // we anchor to; these are filled in by the PR handler which knows the
  // specific file element. This entry exists mainly for the fallback path.
  pr: [
    '.repository-content',
  ],
}

// Resolve an insertion target for a given page kind. `kind` is one of
// 'blob' | 'tree' | 'gist' | 'pr'. Returns a DOM element (never null).
// Logs a diagnostic when it has to fall back past all the known selectors.
export function findInsertionTarget(kind = 'blob') {
  const candidates = SELECTORS[kind] || SELECTORS.blob

  for (const sel of candidates) {
    const el = document.querySelector(sel)
    if (el) return el
  }

  // None of the known selectors matched. Fall back, but record that the
  // DOM did not match anything we recognize, so a "Copy diagnostics" report
  // will reveal that GitHub's layout has drifted for this page kind.
  const main = document.querySelector('main')
  const fallback = main || document.body
  logInfo('insertion-target fallback', {
    kind,
    matched: 'none',
    fallback: main ? 'main' : 'body',
    pathname: location.pathname,
  })
  return fallback
}

// Resolve an insertion target relative to a specific anchor element (used by
// the PR handler, which finds individual changed-file containers and wants
// to insert near each one). Returns the anchor itself if present, else the
// page-kind fallback. Logs when the anchor is missing.
export function findInsertionTargetNear(anchorEl, kind = 'pr') {
  if (anchorEl && anchorEl.parentNode) return anchorEl
  logInfo('insertion-anchor missing', { kind, pathname: location.pathname })
  return findInsertionTarget(kind)
}
