// Lazy loader for SheetJS. Only fetched and parsed when we actually need
// to read an Excel BOM. Loading is one-shot per page: subsequent calls
// return the already-resolved Promise.
//
// Unlike KiCanvas (which has to run in the page main world to register
// custom elements), SheetJS is a pure data-processing library that runs
// fine in the content-script's isolated world. So we don't need a
// script-tag injection dance; we can just fetch the JS as text, eval it
// into a self-contained closure that exposes XLSX on the closure's
// globalThis, and return the XLSX object.
//
// This isolation matters because the page's own scripts may have their
// own `XLSX` global (e.g. if the repo's README embeds a spreadsheet
// preview library). Keeping our copy local prevents collisions.

let xlsxPromise = null

export function loadXlsx() {
  if (xlsxPromise) return xlsxPromise

  xlsxPromise = (async () => {
    if (typeof chrome === 'undefined' || !chrome.runtime?.getURL) {
      throw new Error('chrome.runtime.getURL unavailable (extension context required)')
    }
    const url = chrome.runtime.getURL('vendor/sheetjs/xlsx.mini.min.js')
    const res = await fetch(url)
    if (!res.ok) throw new Error(`SheetJS fetch failed: ${res.status}`)
    const code = await res.text()

    // Evaluate the bundle inside a Function closure so its top-level
    // `var XLSX = {}` lands on our local scope, not the content-script's
    // shared globalThis. Then return that local XLSX.
    //
    // SheetJS's UMD wrapper checks `typeof exports`, `typeof module`,
    // `typeof define`, and `typeof window`. In a Chrome content script
    // none of those are defined except `window`, so SheetJS takes the
    // `make_xlsx_lib(XLSX)` branch which is exactly what we want. We
    // shadow exports/module/define explicitly so the closure behaves
    // consistently in test environments (Node) where those globals leak
    // through to `new Function`.
    const factory = new Function(
      'var XLSX = {};' +
      'var exports = undefined; var module = undefined; var define = undefined;' +
      code +
      '\nreturn XLSX;'
    )
    const XLSX = factory()
    if (!XLSX || typeof XLSX.read !== 'function') {
      throw new Error('SheetJS did not initialize correctly')
    }
    return XLSX
  })()

  return xlsxPromise
}
