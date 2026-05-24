// BOM detection and rendering orchestration. Each handler calls this with
// a list of candidate files and a target DOM node to mount the resulting
// BOM panel after. We split the work this way because each handler
// discovers files differently:
//   - blob/tree: enumerate the GitHub directory listing
//   - zip:       enumerate ZIP entries
//   - gist:      enumerate gist files
// All three call this with the same shape.
//
// File entries are { filename, getContent } for CSV-shaped BOMs (text),
// or { filename, getBytes } for Excel-shaped BOMs (binary). The detector
// picks the right one based on filename extension.

import { parseCsv, parseXlsx, isBomFilename, bomFormatFromFilename } from './bom.js'
import { makeBomPanel } from './bom-panel.js'
import { logError, logInfo } from './eventlog.js'
import { fromThrown } from './errors.js'

// Find the BOM among files. Returns { filename, parsed, format } or null
// if no file is detected / parsing failed.
export async function detectAndParseBom(files) {
  const matches = files.filter((f) => isBomFilename(f.filename))
  if (matches.length === 0) return null

  // Prefer plain "bom.*" over more decorated names (some KiCad workflows
  // emit both a "bom.csv" and a "project-bom.csv"; pick the simpler).
  // Within equal-simplicity, prefer CSV over XLSX because CSV is faster
  // to parse and doesn't require lazy-loading SheetJS. Excel BOMs are
  // still picked when they're the only option, of course.
  matches.sort((a, b) => {
    const aSimple = /^bom\.(csv|tsv|txt|xlsx|xls)$/i.test(a.filename) ? 0 : 1
    const bSimple = /^bom\.(csv|tsv|txt|xlsx|xls)$/i.test(b.filename) ? 0 : 1
    if (aSimple !== bSimple) return aSimple - bSimple
    const aIsCsv = bomFormatFromFilename(a.filename) === 'csv' ? 0 : 1
    const bIsCsv = bomFormatFromFilename(b.filename) === 'csv' ? 0 : 1
    return aIsCsv - bIsCsv
  })

  for (const match of matches) {
    const format = bomFormatFromFilename(match.filename)
    try {
      let parsed = null
      if (format === 'xlsx') {
        if (typeof match.getBytes !== 'function') {
          // Caller didn't supply a binary fetcher; skip and try next.
          continue
        }
        const bytes = await match.getBytes()
        parsed = await parseXlsx(bytes)
      } else {
        if (typeof match.getContent !== 'function') continue
        const text = await match.getContent()
        parsed = parseCsv(text)
      }
      if (parsed && parsed.rows.length > 0) {
        logInfo('BOM parsed', { filename: match.filename, format, rows: parsed.rows.length })
        return { filename: match.filename, parsed, format, getBytes: match.getBytes }
      }
    } catch (e) {
      // Log but continue trying other matches; a malformed BOM in the
      // folder shouldn't prevent rendering the Gerber preview.
      logError(fromThrown(e, { filename: match.filename }))
    }
  }
  return null
}

// Mount a BOM panel into the DOM, immediately after `anchorEl`. Returns
// the BOM panel object (with .panel) or null if no BOM detected. For
// multi-sheet XLSX files, the panel includes a sheet picker that re-runs
// parseXlsx with the chosen sheet name.
export async function mountBomPanel(files, anchorEl) {
  const bom = await detectAndParseBom(files)
  if (!bom) return null

  // For multi-sheet XLSX, build a sheet-switch callback so the panel can
  // re-parse and re-render when the user picks a different sheet.
  let onSwitchSheet = null
  if (bom.format === 'xlsx' && bom.parsed.sheetNames?.length > 1 && bom.getBytes) {
    onSwitchSheet = async (sheetName) => {
      const bytes = await bom.getBytes()
      return parseXlsx(bytes, { sheetName })
    }
  }

  const { panel } = makeBomPanel({
    filename: bom.filename,
    parsed: bom.parsed,
    onSwitchSheet,
  })
  // Insert after the Gerber panel; if anchorEl has a parent we use the
  // standard insertAdjacentElement, otherwise we append to the body.
  if (anchorEl?.parentNode) {
    anchorEl.insertAdjacentElement('afterend', panel)
  } else {
    document.body.appendChild(panel)
  }
  return { panel, filename: bom.filename, rowCount: bom.parsed.rows.length }
}
