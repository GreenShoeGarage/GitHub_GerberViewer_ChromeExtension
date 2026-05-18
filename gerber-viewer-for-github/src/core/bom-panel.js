// BOM panel: renders a parsed BOM (from core/bom.js) as a sortable table
// inside a small container that sits below the main Gerber preview
// panel. Self-contained: no shared state with the Gerber panel.

import { ensureStyles } from './panel.js'
import { mapBomColumns } from './bom.js'

export function makeBomPanel({ filename, parsed, onSwitchSheet = null }) {
  ensureStyles()
  ensureBomStyles()

  const panel = document.createElement('div')
  panel.className = 'ghgv-bom-panel'
  panel.setAttribute('data-ghgv-bom', '1')

  const toolbar = document.createElement('div')
  toolbar.className = 'ghgv-bom-toolbar'

  const title = document.createElement('span')
  title.className = 'ghgv-bom-title'
  title.textContent = `BOM: ${filename}`

  const meta = document.createElement('span')
  meta.className = 'ghgv-bom-meta'

  // Sheet picker for multi-sheet workbooks. Hidden for single-sheet or
  // CSV BOMs since there's nothing to pick.
  let sheetSelect = null
  if (onSwitchSheet && parsed.sheetNames && parsed.sheetNames.length > 1) {
    sheetSelect = document.createElement('select')
    sheetSelect.className = 'ghgv-bom-sheet-picker'
    sheetSelect.title = 'Switch to a different sheet in this workbook'
    for (const name of parsed.sheetNames) {
      const opt = document.createElement('option')
      opt.value = name
      opt.textContent = name
      if (name === parsed.activeSheet) opt.selected = true
      sheetSelect.appendChild(opt)
    }
  }

  const spacer = document.createElement('span')
  spacer.style.flex = '1'

  const copyBtn = document.createElement('button')
  copyBtn.className = 'ghgv-btn'
  copyBtn.textContent = 'Copy as TSV'
  copyBtn.title = 'Copy the table to clipboard as tab-separated values'

  const toggleBtn = document.createElement('button')
  toggleBtn.className = 'ghgv-btn'
  toggleBtn.textContent = 'Hide'

  if (sheetSelect) {
    toolbar.append(title, sheetSelect, meta, spacer, copyBtn, toggleBtn)
  } else {
    toolbar.append(title, meta, spacer, copyBtn, toggleBtn)
  }
  panel.appendChild(toolbar)

  const tableWrap = document.createElement('div')
  tableWrap.className = 'ghgv-bom-table-wrap'
  panel.appendChild(tableWrap)

  const table = document.createElement('table')
  table.className = 'ghgv-bom-table'
  tableWrap.appendChild(table)

  // Mutable working set: current headers and rows for whichever sheet is
  // active. Updated when the user picks a different sheet.
  let currentHeaders = parsed.headers
  let currentRows = parsed.rows.slice()
  let currentSortKey = null
  let currentSortDir = 1

  function updateMeta() {
    meta.textContent = `${currentRows.length} rows • ${currentHeaders.length} columns`
  }
  updateMeta()

  // Build the thead from currentHeaders. Idempotent: clears existing
  // header cells first so we can rebuild on sheet switch.
  const thead = document.createElement('thead')
  table.appendChild(thead)

  function buildHeader() {
    thead.innerHTML = ''
    const headRow = document.createElement('tr')
    for (const h of currentHeaders) {
      const th = document.createElement('th')
      th.textContent = h || '(blank)'
      th.dataset.header = h
      th.addEventListener('click', () => sortBy(h, th))
      headRow.appendChild(th)
    }
    thead.appendChild(headRow)
  }
  buildHeader()

  const tbody = document.createElement('tbody')
  table.appendChild(tbody)

  function renderRows(rows) {
    tbody.innerHTML = ''
    for (const row of rows) {
      const tr = document.createElement('tr')
      for (const h of currentHeaders) {
        const td = document.createElement('td')
        td.textContent = row[h] != null ? String(row[h]) : ''
        tr.appendChild(td)
      }
      tbody.appendChild(tr)
    }
  }
  renderRows(currentRows)

  // Sheet picker change handler: re-parse the workbook with the new sheet
  // name, swap in the new headers/rows, rebuild header and body.
  if (sheetSelect) {
    sheetSelect.addEventListener('change', async () => {
      const newSheet = sheetSelect.value
      try {
        const reparsed = await onSwitchSheet(newSheet)
        if (!reparsed) {
          // Empty sheet: clear the table and update meta to reflect it
          currentHeaders = []
          currentRows = []
          buildHeader()
          renderRows([])
          updateMeta()
          return
        }
        currentHeaders = reparsed.headers
        currentRows = reparsed.rows.slice()
        currentSortKey = null
        currentSortDir = 1
        buildHeader()
        renderRows(currentRows)
        updateMeta()
      } catch (e) {
        // Surface failure in the meta line so the user knows something
        // went wrong without breaking the rest of the panel.
        meta.textContent = `Could not switch sheet: ${e.message || e}`
      }
    })
  }

  function sortBy(key, th) {
    // Toggle direction if already sorted by this key
    if (currentSortKey === key) {
      currentSortDir = -currentSortDir
    } else {
      currentSortKey = key
      currentSortDir = 1
    }
    const sorted = currentRows.slice().sort((a, b) => {
      const av = a[key] != null ? String(a[key]) : ''
      const bv = b[key] != null ? String(b[key]) : ''
      // Try numeric comparison first; fall back to string
      const an = parseFloat(av)
      const bn = parseFloat(bv)
      if (!isNaN(an) && !isNaN(bn) && av.trim() !== '' && bv.trim() !== '') {
        return (an - bn) * currentSortDir
      }
      return av.localeCompare(bv) * currentSortDir
    })
    renderRows(sorted)
    // Update header indicator
    for (const otherTh of thead.querySelectorAll('th')) {
      otherTh.classList.remove('ghgv-bom-sorted-asc', 'ghgv-bom-sorted-desc')
    }
    th.classList.add(currentSortDir === 1 ? 'ghgv-bom-sorted-asc' : 'ghgv-bom-sorted-desc')
  }

  copyBtn.addEventListener('click', async () => {
    const lines = [currentHeaders.join('\t')]
    for (const row of currentRows) {
      lines.push(currentHeaders.map((h) => (row[h] != null ? String(row[h]) : '')).join('\t'))
    }
    const text = lines.join('\n')
    try {
      await navigator.clipboard.writeText(text)
      const orig = copyBtn.textContent
      copyBtn.textContent = 'Copied!'
      setTimeout(() => { copyBtn.textContent = orig }, 1500)
    } catch (e) {
      copyBtn.textContent = 'Copy failed'
      setTimeout(() => { copyBtn.textContent = 'Copy as TSV' }, 2000)
    }
  })

  toggleBtn.addEventListener('click', () => {
    if (tableWrap.style.display === 'none') {
      tableWrap.style.display = ''
      toggleBtn.textContent = 'Hide'
    } else {
      tableWrap.style.display = 'none'
      toggleBtn.textContent = 'Show'
    }
  })

  return { panel }
}

const BOM_STYLE_ID = 'ghgv-bom-styles'

function ensureBomStyles() {
  if (document.getElementById(BOM_STYLE_ID)) return
  const style = document.createElement('style')
  style.id = BOM_STYLE_ID
  style.textContent = `
    .ghgv-bom-panel {
      margin: 12px 0;
      border: 1px solid var(--borderColor-default, #d0d7de);
      border-radius: 6px;
      background: var(--bgColor-default, #ffffff);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 13px;
    }
    .ghgv-bom-toolbar {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      border-bottom: 1px solid var(--borderColor-default, #d0d7de);
      background: var(--bgColor-muted, #f6f8fa);
      border-radius: 6px 6px 0 0;
    }
    .ghgv-bom-title {
      font-weight: 600;
      color: var(--fgColor-default, #1f2328);
    }
    .ghgv-bom-meta {
      color: var(--fgColor-muted, #656d76);
      font-family: ui-monospace, SFMono-Regular, monospace;
      font-size: 12px;
    }
    .ghgv-bom-sheet-picker {
      padding: 4px 8px;
      border-radius: 4px;
      border: 1px solid var(--borderColor-default, #d0d7de);
      background: var(--bgColor-default, #ffffff);
      color: var(--fgColor-default, #1f2328);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 12px;
      cursor: pointer;
    }
    .ghgv-bom-sheet-picker:hover {
      border-color: #0e7c3a;
    }
    .ghgv-bom-table-wrap {
      max-height: 400px;
      overflow: auto;
    }
    .ghgv-bom-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    .ghgv-bom-table thead {
      position: sticky;
      top: 0;
      background: var(--bgColor-muted, #f6f8fa);
      z-index: 1;
    }
    .ghgv-bom-table th {
      text-align: left;
      padding: 8px 12px;
      border-bottom: 1px solid var(--borderColor-default, #d0d7de);
      cursor: pointer;
      user-select: none;
      font-weight: 600;
      color: var(--fgColor-default, #1f2328);
      white-space: nowrap;
    }
    .ghgv-bom-table th:hover {
      background: var(--bgColor-default, #ffffff);
    }
    .ghgv-bom-table th.ghgv-bom-sorted-asc::after {
      content: ' \u2191';
      color: var(--fgColor-accent, #0969da);
    }
    .ghgv-bom-table th.ghgv-bom-sorted-desc::after {
      content: ' \u2193';
      color: var(--fgColor-accent, #0969da);
    }
    .ghgv-bom-table td {
      padding: 6px 12px;
      border-bottom: 1px solid var(--borderColor-muted, #f0f0f0);
      color: var(--fgColor-default, #1f2328);
      font-family: ui-monospace, SFMono-Regular, monospace;
      font-size: 12px;
      white-space: nowrap;
    }
    .ghgv-bom-table tr:hover td {
      background: var(--bgColor-muted, #f6f8fa);
    }
  `
  document.head.appendChild(style)
}
