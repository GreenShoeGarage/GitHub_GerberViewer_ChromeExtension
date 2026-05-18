// Lightweight CSV parser. RFC 4180-shaped behavior:
//   - Comma-separated by default; auto-detects tab and semicolon as
//     fallback delimiters.
//   - Double-quoted fields can contain commas, newlines, and escaped
//     quotes ("").
//   - Whitespace inside quoted fields is preserved; whitespace outside
//     is trimmed.
//   - Trailing newlines and blank rows are dropped.
//
// Returns { headers, rows } where rows is an array of objects keyed by
// the header names. If parsing yields no rows, returns null.
//
// Bundled rather than pulling in Papa Parse, because the cases we care
// about (BOMs exported by KiCad, EasyEDA, Eagle, Altium, and the
// occasional hand-written file) are well within standard CSV.
//
// XLSX/XLS parsing is delegated to a lazy-loaded SheetJS bundle via the
// xlsx-loader module, so the cost of supporting Excel BOMs is only paid
// when one is actually opened.

import { loadXlsx } from './xlsx-loader.js'

function detectDelimiter(text) {
  // Look at the first 1024 chars and count occurrences of common
  // delimiters outside quoted regions. Highest count wins, with a
  // tiebreaker preferring comma.
  const sample = text.slice(0, 1024)
  let inQuote = false
  let counts = { ',': 0, '\t': 0, ';': 0 }
  for (let i = 0; i < sample.length; i++) {
    const c = sample[i]
    if (c === '"') {
      inQuote = !inQuote
      continue
    }
    if (inQuote) continue
    if (c in counts) counts[c]++
  }
  const best = Object.entries(counts).reduce((a, b) => (b[1] > a[1] ? b : a), [',', -1])
  return best[1] > 0 ? best[0] : ','
}

function parseCsvText(text, delimiter) {
  const rows = []
  let row = []
  let field = ''
  let inQuote = false
  let i = 0
  while (i < text.length) {
    const c = text[i]
    if (inQuote) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          // Escaped quote inside a quoted field
          field += '"'
          i += 2
          continue
        }
        inQuote = false
        i++
        continue
      }
      field += c
      i++
      continue
    }
    if (c === '"') {
      inQuote = true
      i++
      continue
    }
    if (c === delimiter) {
      row.push(field.trim())
      field = ''
      i++
      continue
    }
    if (c === '\r') {
      // Treat CRLF as a single line break by skipping the \n that follows
      if (text[i + 1] === '\n') i++
      row.push(field.trim())
      if (row.some((v) => v !== '')) rows.push(row)
      row = []
      field = ''
      i++
      continue
    }
    if (c === '\n') {
      row.push(field.trim())
      if (row.some((v) => v !== '')) rows.push(row)
      row = []
      field = ''
      i++
      continue
    }
    field += c
    i++
  }
  if (field !== '' || row.length > 0) {
    row.push(field.trim())
    if (row.some((v) => v !== '')) rows.push(row)
  }
  return rows
}

export function parseCsv(text) {
  if (!text || typeof text !== 'string') return null
  const delimiter = detectDelimiter(text)
  const raw = parseCsvText(text, delimiter)
  if (raw.length < 2) return null   // need at least a header row + one data row

  // Some BOM exports include a comment block above the header. We try to
  // identify the real header row by finding the first row whose cells
  // contain at least one column name we recognize (Reference, Designator,
  // Quantity, Value, Footprint, Part Number, Manufacturer, etc.). If none
  // is found, fall back to the first row.
  const COMMON_HEADERS = /^(reference|designator|designators|qty|quantity|value|footprint|package|part(\s|_)?(number|name)|manufacturer|mpn|description|comment|net)$/i
  let headerIdx = 0
  for (let i = 0; i < Math.min(raw.length, 10); i++) {
    if (raw[i].some((cell) => COMMON_HEADERS.test(cell.trim()))) {
      headerIdx = i
      break
    }
  }
  const headers = raw[headerIdx]
  const dataRows = raw.slice(headerIdx + 1).filter((r) => r.length > 0)

  // Build row objects keyed by header. If a row has fewer cells than the
  // header, missing values default to empty strings; extra cells beyond
  // the header are dropped.
  const rowObjects = dataRows.map((r) => {
    const obj = {}
    for (let i = 0; i < headers.length; i++) {
      obj[headers[i] || `col_${i + 1}`] = r[i] !== undefined ? r[i] : ''
    }
    return obj
  })

  return { headers, rows: rowObjects, delimiter }
}

// Parse an Excel workbook (XLSX or legacy XLS) from raw bytes. Returns
// the same `{ headers, rows }` shape as parseCsv, plus a `sheetNames`
// list and `activeSheet` indicating which sheet was used. Returns null
// if SheetJS can't parse the bytes or no sheet contains usable data.
//
// Sheet selection: if the workbook has a sheet named "BOM" (case-
// insensitive), use it. Otherwise pick the first non-empty sheet. If
// the caller wants a specific sheet, they can pass its name in opts.
//
// This is async because it lazy-loads SheetJS, which is a ~245 KB
// vendored library that we'd rather not pay for on every page load.
export async function parseXlsx(bytes, opts = {}) {
  if (!bytes) return null
  let XLSX
  try {
    XLSX = await loadXlsx()
  } catch (e) {
    // Surface the loader failure so callers can show an actionable error
    throw new Error(`XLSX loader failed: ${e.message || e}`)
  }
  let wb
  try {
    // Normalize the input to a Uint8Array constructed from our own realm's
    // ArrayBuffer constructor. SheetJS does internal instanceof checks
    // (`bytes instanceof ArrayBuffer`) that fail when the input came from
    // a different JS realm (e.g. jsdom in tests, or theoretically a worker
    // postMessage in production). A one-time copy avoids the cross-realm
    // mismatch and is cheap relative to parsing the workbook.
    let normalized
    if (bytes instanceof Uint8Array) {
      normalized = new Uint8Array(bytes.byteLength)
      normalized.set(bytes)
    } else {
      // ArrayBuffer-like (has byteLength); copy via Uint8Array view.
      const src = new Uint8Array(bytes)
      normalized = new Uint8Array(src.byteLength)
      normalized.set(src)
    }
    wb = XLSX.read(normalized, { type: 'array' })
  } catch (e) {
    throw new Error(`XLSX parse failed: ${e.message || e}`)
  }
  if (!wb.SheetNames || wb.SheetNames.length === 0) return null

  // Pick the sheet: explicit opt > sheet named "BOM"/"Bill of Materials" >
  // first non-empty sheet.
  let chosen = opts.sheetName
  if (!chosen) {
    chosen = wb.SheetNames.find((n) => /^(bom|bill\s*of\s*materials)$/i.test(n.trim()))
  }
  if (!chosen) {
    // First sheet that has any data
    chosen = wb.SheetNames.find((name) => {
      const s = wb.Sheets[name]
      return s && s['!ref']  // !ref is the used range; absent means empty
    })
  }
  if (!chosen) return null

  const sheet = wb.Sheets[chosen]
  // header: 1 → return arrays-of-arrays so we keep the same downstream
  // shape as the CSV path. raw: false → coerce numbers/dates to display
  // strings (avoids users seeing "44197" for a date or "0.001" for 1mΩ).
  // defval: '' → empty cells become empty strings rather than undefined.
  const aoa = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '' })
  if (!aoa || aoa.length < 2) return null

  // Identify header row using the same heuristic as parseCsv: first row
  // (within the top 10) whose cells include a recognizable BOM column name.
  const COMMON_HEADERS = /^(reference|designator|designators|qty|quantity|value|footprint|package|part(\s|_)?(number|name)|manufacturer|mpn|description|comment|net)$/i
  let headerIdx = 0
  for (let i = 0; i < Math.min(aoa.length, 10); i++) {
    if (aoa[i].some((cell) => COMMON_HEADERS.test(String(cell || '').trim()))) {
      headerIdx = i
      break
    }
  }
  const headers = aoa[headerIdx].map((h) => String(h || '').trim())
  const dataRows = aoa.slice(headerIdx + 1).filter((r) => r.some((c) => String(c || '').trim() !== ''))

  const rows = dataRows.map((r) => {
    const obj = {}
    for (let i = 0; i < headers.length; i++) {
      obj[headers[i] || `col_${i + 1}`] = r[i] !== undefined ? String(r[i]) : ''
    }
    return obj
  })

  return {
    headers,
    rows,
    sheetNames: wb.SheetNames,
    activeSheet: chosen,
  }
}
export function isBomFilename(filename) {
  if (!filename) return false
  return /(^|[\s._-])bom\.(csv|tsv|txt|xlsx|xls)$/i.test(filename) ||
         /^bom\.(csv|tsv|txt|xlsx|xls)$/i.test(filename) ||
         /\.bom$/i.test(filename)
}

// Subtype detector: returns 'csv' or 'xlsx' (which also covers xls)
// based on filename extension. The mount logic uses this to decide
// whether to call parseCsv or parseXlsx.
export function bomFormatFromFilename(filename) {
  if (!filename) return 'csv'
  if (/\.xlsx?$/i.test(filename)) return 'xlsx'
  return 'csv'
}

// Identify which columns from a parsed BOM correspond to the canonical
// fields we care about most (Reference, Quantity, Value, Footprint,
// Description, Manufacturer Part Number). Returns an object whose values
// are the header strings (or null when no match), so callers can write
// row[mapping.reference] without re-doing the matching.
export function mapBomColumns(headers) {
  const mapping = {
    reference: null,
    quantity: null,
    value: null,
    footprint: null,
    description: null,
    mpn: null,
  }
  for (const h of headers) {
    const norm = (h || '').toLowerCase().trim()
    if (!mapping.reference && /^(reference|designator|designators|refdes)s?$/i.test(norm)) {
      mapping.reference = h
    } else if (!mapping.quantity && /^(qty|quantity|count)$/i.test(norm)) {
      mapping.quantity = h
    } else if (!mapping.value && /^(value|comment)$/i.test(norm)) {
      mapping.value = h
    } else if (!mapping.footprint && /^(footprint|package|pkg)$/i.test(norm)) {
      mapping.footprint = h
    } else if (!mapping.description && /^description$/i.test(norm)) {
      mapping.description = h
    } else if (!mapping.mpn && /(mpn|manufacturer.*part.*number|part.*number)/i.test(norm)) {
      mapping.mpn = h
    }
  }
  return mapping
}
