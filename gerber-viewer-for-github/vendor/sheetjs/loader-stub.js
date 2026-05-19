// Page-world bootstrap for SheetJS. Imported by a <script src> tag that
// the content script injects. Runs in the page's main world (not the
// extension's isolated world), where:
//
//   1. SheetJS can safely register as window.XLSX without our extension
//      CSP forbidding `new Function`-style eval inside its UMD wrapper.
//
//   2. We expose a postMessage-based parse API so the isolated-world
//      content script can ask us to parse a workbook and get back a
//      plain-JSON result that crosses the world boundary cleanly.
//
// The protocol:
//
//   content script  ->  page main world (this script):
//     window.postMessage({
//       source: 'ghgv-xlsx-request',
//       id: '<uuid>',
//       bytes: <base64-encoded workbook bytes>,
//       sheetName: '<optional explicit sheet>',
//     }, '*')
//
//   page main world (this script)  ->  content script:
//     window.postMessage({
//       source: 'ghgv-xlsx-response',
//       id: '<uuid>',
//       result: { headers, rows, sheetNames, activeSheet } | null,
//       error: '<message>' | null,
//     }, '*')
//
// We use base64 rather than transferable Uint8Array because postMessage
// across worlds doesn't reliably preserve typed-array constructors, and
// base64 is small enough for typical BOM sizes (a 50 KB XLSX becomes
// ~68 KB base64).

(async () => {
  // Already loaded once? Avoid double-running listeners if a page-nav
  // re-injects this stub.
  if (window.__ghgvSheetJsLoaderRan) return
  window.__ghgvSheetJsLoaderRan = true

  // Find the SheetJS bundle URL via the data-attribute on the <script>
  // tag that loaded us. We pass the URL this way because we can't
  // hardcode it (each extension install has a different ID).
  const scriptTag = document.getElementById('ghgv-sheetjs-loader')
  const xlsxUrl = scriptTag?.dataset?.xlsxUrl
  if (!xlsxUrl) {
    console.warn('[gerber-gh] SheetJS loader: missing xlsx URL on script tag')
    return
  }

  // Load SheetJS by injecting a regular <script> tag pointing at the
  // mini bundle. The bundle's UMD wrapper finds no exports/module/define
  // in this scope, falls through to the global-attach branch, and sets
  // window.XLSX.
  await new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = xlsxUrl
    s.onload = resolve
    s.onerror = () => reject(new Error('SheetJS bundle failed to load'))
    document.head.appendChild(s)
  }).catch((e) => {
    console.warn('[gerber-gh]', e.message)
  })

  if (typeof window.XLSX === 'undefined' || typeof window.XLSX.read !== 'function') {
    console.warn('[gerber-gh] SheetJS did not initialize after load')
    return
  }

  // Signal readiness via a shared DOM attribute so the content script
  // knows it can start sending parse requests.
  document.documentElement.dataset.ghgvXlsxReady = '1'

  // Listen for parse requests from the content script. Same-origin
  // postMessage from the same window; we filter by the `source` field
  // to avoid responding to unrelated messages.
  window.addEventListener('message', (event) => {
    if (event.source !== window) return
    const msg = event.data
    if (!msg || msg.source !== 'ghgv-xlsx-request' || !msg.id) return

    const respond = (result, error) => {
      window.postMessage({
        source: 'ghgv-xlsx-response',
        id: msg.id,
        result: result || null,
        error: error || null,
      }, '*')
    }

    try {
      const binary = atob(msg.bytes)
      const u8 = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) u8[i] = binary.charCodeAt(i)

      const wb = window.XLSX.read(u8, { type: 'array' })
      if (!wb.SheetNames || wb.SheetNames.length === 0) {
        respond(null, 'workbook has no sheets')
        return
      }

      // Sheet selection: explicit > "BOM"/"Bill of Materials" > first non-empty
      let chosen = msg.sheetName
      if (!chosen) {
        chosen = wb.SheetNames.find((n) => /^(bom|bill\s*of\s*materials)$/i.test(n.trim()))
      }
      if (!chosen) {
        chosen = wb.SheetNames.find((name) => {
          const s = wb.Sheets[name]
          return s && s['!ref']
        })
      }
      if (!chosen) {
        respond(null, 'no non-empty sheet found')
        return
      }

      const sheet = wb.Sheets[chosen]
      const aoa = window.XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        raw: false,
        defval: '',
      })
      if (!aoa || aoa.length < 2) {
        respond(null, 'sheet has fewer than 2 rows')
        return
      }

      // Identify header row (same heuristic as parseCsv)
      const COMMON = /^(reference|designator|designators|qty|quantity|value|footprint|package|part(\s|_)?(number|name)|manufacturer|mpn|description|comment|net)$/i
      let headerIdx = 0
      for (let i = 0; i < Math.min(aoa.length, 10); i++) {
        if (aoa[i].some((cell) => COMMON.test(String(cell || '').trim()))) {
          headerIdx = i
          break
        }
      }
      const headers = aoa[headerIdx].map((h) => String(h || '').trim())
      const dataRows = aoa.slice(headerIdx + 1).filter((r) =>
        r.some((c) => String(c || '').trim() !== '')
      )
      const rows = dataRows.map((r) => {
        const obj = {}
        for (let i = 0; i < headers.length; i++) {
          obj[headers[i] || `col_${i + 1}`] = r[i] !== undefined ? String(r[i]) : ''
        }
        return obj
      })

      respond({
        headers,
        rows,
        sheetNames: wb.SheetNames,
        activeSheet: chosen,
      })
    } catch (e) {
      respond(null, e.message || String(e))
    }
  })
})()
