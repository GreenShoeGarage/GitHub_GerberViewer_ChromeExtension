// Loader stub for KiCanvas. Runs in the page's main world (injected as a
// <script type="module">). Imports the kicanvas bundle so it registers
// its custom elements, then writes a flag to <html data-ghgv-kicanvas-ready>
// so the content script (running in an isolated world) can detect that
// loading completed via the shared DOM (the only thing the two worlds
// reliably share).

import "./kicanvas.js"
document.documentElement.dataset.ghgvKicanvasReady = "1"
