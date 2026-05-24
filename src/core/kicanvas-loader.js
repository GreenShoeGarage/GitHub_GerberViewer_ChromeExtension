// Bootstrap helper for KiCanvas. Loads the vendored kicanvas.js bundle into
// the page's main world by injecting a <script type="module"> that points
// at the extension's own resources URL. This keeps execution local (no
// remote code) while still allowing <kicanvas-embed> to register itself
// as a custom element in the document's main realm where it can render.

const READY_ATTR = 'ghgvKicanvasReady'
const SCRIPT_ID = 'ghgv-kicanvas-loader'

// Single in-flight promise so concurrent calls share the same load.
let inFlight = null

function isReady() {
  return document.documentElement.dataset[READY_ATTR] === '1'
}

export function loadKiCanvas() {
  if (isReady()) return Promise.resolve()
  if (inFlight) return inFlight

  inFlight = new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID)

    if (!existing) {
      // The stub imports kicanvas, then sets a dataset flag on <html>.
      // We can't observe window properties across realms, but the DOM is
      // shared, so the dataset is the signal.
      const stubUrl = chrome.runtime.getURL('vendor/kicanvas/loader-stub.js')
      const script = document.createElement('script')
      script.id = SCRIPT_ID
      script.type = 'module'
      script.src = stubUrl
      script.onerror = () => reject(new Error('Failed to load KiCanvas bundle'))
      document.head.appendChild(script)
    }

    const start = Date.now()
    const tick = () => {
      if (isReady()) return resolve()
      if (Date.now() - start > 15000) return reject(new Error('KiCanvas load timed out'))
      setTimeout(tick, 50)
    }
    tick()
  })
  return inFlight
}
