// Pull request handler. On a PR "Files changed" page, find Gerber, drill,
// and KiCad files that the PR touches and render a before/after preview for
// each, so a reviewer can see what a board change actually looks like
// without checking out the branch.
//
// For each changed file we show:
//   - added:    after only (the new file), labeled "Added"
//   - removed:  before only (the deleted file), labeled "Removed"
//   - modified: before and after side by side, labeled "Before" / "After"
//   - renamed:  before (old path) and after (new path), noting the rename
//
// We render single-layer previews (one Gerber = one layer), not full
// stackups, because a PR diff is about the individual file that changed.
// Compositing the whole board would require fetching every sibling at both
// commits, which is a lot of API calls for marginal value in a diff view.

import { fetchPullMeta, fetchPullFiles, rawUrlAt, fetchRaw } from '../core/github.js'
import { looksLikeGerberByName, looksLikeGerberByContent } from '../core/detect.js'
import { renderSingleLayer } from '../core/render.js'
import { findInsertionTarget } from '../core/insertion.js'
import { ensureStyles } from '../core/panel.js'
import { fromThrown } from '../core/errors.js'
import { logActivation, logError, logRender } from '../core/eventlog.js'

export async function handlePull(info, ctx = {}) {
  if (info.kind !== 'pull') return false
  if (document.querySelector('[data-ghgv-pr="1"]')) return true

  logActivation({ url: window.location.href, kind: 'pull', filename: `PR #${info.number}` })

  let meta, files
  try {
    [meta, files] = await Promise.all([
      fetchPullMeta(info),
      fetchPullFiles(info),
    ])
  } catch (e) {
    // Pre-panel: if we can't reach the API, stay silent (might just be rate
    // limited). Log for diagnostics.
    logError(fromThrown(e, { url: window.location.href }))
    return false
  }

  // Keep only files that look like Gerber/drill by name. We can't content-
  // sniff until we fetch, so name filtering first keeps the API budget down.
  const gerberChanges = files.filter((f) => looksLikeGerberByName(f.filename))
  if (gerberChanges.length === 0) return false  // no board files in this PR

  ensureStyles()
  ensurePrStyles()

  // Mount a container panel that holds one card per changed file.
  const container = document.createElement('div')
  container.className = 'ghgv-pr-container'
  container.setAttribute('data-ghgv-pr', '1')

  const header = document.createElement('div')
  header.className = 'ghgv-pr-header'
  header.textContent = `Gerber Viewer: ${gerberChanges.length} board file${gerberChanges.length === 1 ? '' : 's'} changed in this pull request`
  container.appendChild(header)

  const target = findInsertionTarget('pr')
  target.insertBefore(container, target.firstChild)

  // Render each changed file's before/after. We do these sequentially to
  // keep memory bounded and avoid hammering the raw host; boards are big.
  let rendered = 0
  for (const change of gerberChanges) {
    const card = document.createElement('div')
    card.className = 'ghgv-pr-card'

    const title = document.createElement('div')
    title.className = 'ghgv-pr-card-title'
    const statusLabel = formatStatus(change.status)
    title.textContent = `${change.filename}  (${statusLabel})`
    card.appendChild(title)

    const pair = document.createElement('div')
    pair.className = 'ghgv-pr-pair'
    card.appendChild(pair)
    container.appendChild(card)

    // Decide which sides to render based on the change status.
    const wantBefore = change.status === 'modified' || change.status === 'removed' || change.status === 'renamed'
    const wantAfter = change.status === 'modified' || change.status === 'added' || change.status === 'renamed'

    // The "before" file path for a rename is previous_filename.
    const beforePath = change.previous_filename || change.filename
    const afterPath = change.filename

    if (wantBefore) {
      const beforeUrl = rawUrlAt({ owner: meta.base.owner, repo: meta.base.repo, sha: meta.base.sha, filepath: beforePath })
      pair.appendChild(await renderSide('Before', beforeUrl))
    }
    if (wantAfter) {
      const afterUrl = rawUrlAt({ owner: meta.head.owner, repo: meta.head.repo, sha: meta.head.sha, filepath: afterPath })
      pair.appendChild(await renderSide('After', afterUrl))
    }
    rendered++
  }

  logRender({ view: 'pr-diff', layerCount: rendered })
  return true
}

function formatStatus(status) {
  switch (status) {
    case 'added': return 'added'
    case 'removed': return 'removed'
    case 'renamed': return 'renamed'
    case 'modified': return 'modified'
    default: return status || 'changed'
  }
}

// Render one side (Before or After) into a labeled cell. Fetches the raw
// file, content-sniffs it, and renders a single-layer SVG. On any failure
// the cell shows a short message rather than breaking the whole card.
async function renderSide(label, rawUrl) {
  const cell = document.createElement('div')
  cell.className = 'ghgv-pr-cell'

  const cellLabel = document.createElement('div')
  cellLabel.className = 'ghgv-pr-cell-label'
  cellLabel.textContent = label
  cell.appendChild(cellLabel)

  const stage = document.createElement('div')
  stage.className = 'ghgv-pr-stage'
  cell.appendChild(stage)

  try {
    const text = await fetchRaw(rawUrl)
    if (!looksLikeGerberByContent(text)) {
      stage.textContent = 'Not recognized as Gerber'
      stage.classList.add('ghgv-pr-stage-empty')
      return cell
    }
    const svg = await renderSingleLayer(text, false)
    stage.innerHTML = svg
  } catch (e) {
    stage.textContent = 'Could not load this revision'
    stage.classList.add('ghgv-pr-stage-empty')
  }
  return cell
}

const PR_STYLE_ID = 'ghgv-pr-styles'

function ensurePrStyles() {
  if (document.getElementById(PR_STYLE_ID)) return
  const style = document.createElement('style')
  style.id = PR_STYLE_ID
  style.textContent = `
    .ghgv-pr-container {
      margin: 12px 0;
      border: 1px solid var(--borderColor-default, #d0d7de);
      border-radius: 6px;
      background: var(--bgColor-default, #ffffff);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .ghgv-pr-header {
      padding: 10px 14px;
      font-weight: 600;
      font-size: 13px;
      color: #1f2328;
      border-bottom: 1px solid var(--borderColor-default, #d0d7de);
      background: var(--bgColor-muted, #f6f8fa);
      border-radius: 6px 6px 0 0;
    }
    .ghgv-pr-card {
      padding: 12px 14px;
      border-bottom: 1px solid var(--borderColor-muted, #f0f0f0);
    }
    .ghgv-pr-card:last-child { border-bottom: none; }
    .ghgv-pr-card-title {
      font-family: ui-monospace, SFMono-Regular, monospace;
      font-size: 12px;
      color: #1f2328;
      margin-bottom: 8px;
    }
    .ghgv-pr-pair {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    .ghgv-pr-cell {
      flex: 1 1 280px;
      min-width: 240px;
      border: 1px solid var(--borderColor-default, #d0d7de);
      border-radius: 6px;
      overflow: hidden;
    }
    .ghgv-pr-cell-label {
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      color: #656d76;
      background: var(--bgColor-muted, #f6f8fa);
      border-bottom: 1px solid var(--borderColor-default, #d0d7de);
    }
    .ghgv-pr-stage {
      padding: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 160px;
      max-height: 50vh;
      overflow: auto;
      background:
        repeating-conic-gradient(#e6e6e6 0% 25%, transparent 0% 50%) 50% / 16px 16px;
    }
    .ghgv-pr-stage svg {
      max-width: 100%;
      height: auto;
    }
    .ghgv-pr-stage-empty {
      color: #656d76;
      font-size: 12px;
      font-style: italic;
      background: var(--bgColor-muted, #f6f8fa);
    }
  `
  document.head.appendChild(style)
}
