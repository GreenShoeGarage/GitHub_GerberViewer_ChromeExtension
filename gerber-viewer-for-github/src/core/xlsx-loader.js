// Content-script side of the SheetJS bridge. Injects a <script> tag that
// loads SheetJS into the page's main world (where eval is not forbidden
// by our extension's CSP), then talks to it via postMessage.
//
// The page-side stub does the actual SheetJS work and returns parsed
// JSON. We never bring SheetJS into the isolated world; we just send
// bytes (base64) and receive a workbook structure.
//
// Public API:
//   parseXlsxInPage(bytes, sheetName?)
//     - bytes: ArrayBuffer or Uint8Array
//     - sheetName: optional sheet to parse; falls back to "BOM" then first
//     Returns Promise<{ headers, rows, sheetNames, activeSheet }> or rejects.

const STUB_SCRIPT_ID = 'ghgv-sheetjs-loader'
const READY_ATTR = 'ghgvXlsxReady'
const REQUEST_TIMEOUT_MS = 15000

let injected = false
let readyPromise = null

function isReady() {
  return document.documentElement.dataset[READY_ATTR] === '1'
}

function injectStub() {
  if (injected) return
  injected = true
  const xlsxUrl = chrome.runtime.getURL('vendor/sheetjs/xlsx.mini.min.js')
  const stubUrl = chrome.runtime.getURL('vendor/sheetjs/loader-stub.js')
  const script = document.createElement('script')
  script.id = STUB_SCRIPT_ID
  script.src = stubUrl
  script.dataset.xlsxUrl = xlsxUrl
  document.head.appendChild(script)
}

function waitForReady() {
  if (readyPromise) return readyPromise
  readyPromise = new Promise((resolve, reject) => {
    injectStub()
    if (isReady()) return resolve()
    const start = Date.now()
    const tick = () => {
      if (isReady()) return resolve()
      if (Date.now() - start > REQUEST_TIMEOUT_MS) {
        return reject(new Error('SheetJS load timed out'))
      }
      setTimeout(tick, 50)
    }
    tick()
  })
  return readyPromise
}

// Convert an ArrayBuffer or Uint8Array to base64. Browsers don't have a
// direct API for this; we build it via a Uint8Array view.
function bytesToBase64(bytes) {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  // Process in chunks to avoid the "Maximum call stack size exceeded" trap
  // that String.fromCharCode.apply hits with very large arrays.
  const CHUNK = 0x8000
  let binary = ''
  for (let i = 0; i < u8.length; i += CHUNK) {
    binary += String.fromCharCode.apply(null, u8.subarray(i, i + CHUNK))
  }
  return btoa(binary)
}

let nextRequestId = 1

export async function parseXlsxInPage(bytes, sheetName) {
  await waitForReady()
  const id = `ghgv-${Date.now()}-${nextRequestId++}`
  const base64 = bytesToBase64(bytes)

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      window.removeEventListener('message', onMessage)
      reject(new Error('XLSX parse timed out'))
    }, REQUEST_TIMEOUT_MS)

    function onMessage(event) {
      if (event.source !== window) return
      const msg = event.data
      if (!msg || msg.source !== 'ghgv-xlsx-response' || msg.id !== id) return
      clearTimeout(timer)
      window.removeEventListener('message', onMessage)
      if (msg.error) {
        reject(new Error(msg.error))
      } else {
        resolve(msg.result)
      }
    }
    window.addEventListener('message', onMessage)

    window.postMessage({
      source: 'ghgv-xlsx-request',
      id,
      bytes: base64,
      sheetName: sheetName || null,
    }, '*')
  })
}
