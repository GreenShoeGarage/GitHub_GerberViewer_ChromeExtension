// Gerber Viewer for GitHub - content script
// Renders Gerber/Excellon files inline on github.com/*/blob/* pages.
// v0.2 adds multi-layer top/bottom composite rendering via pcb-stackup.

import gerberToSvg from 'gerber-to-svg'
import whatsThatGerber from 'whats-that-gerber'
import pcbStackup from 'pcb-stackup'

const GERBER_EXTENSIONS = [
  // Common Gerber layer extensions
  'gbr', 'gbl', 'gtl', 'gbs', 'gts', 'gbo', 'gto', 'gbp', 'gtp',
  'gko', 'gm1', 'gm2', 'gm3', 'gml', 'gpb', 'gpt',
  // Eagle / CadSoft
  'cmp', 'sol', 'plc', 'pls', 'stc', 'sts',
  // Altium
  'gd1', 'gg1', 'gp1', 'gp2', 'gp3', 'gp4',
  // Excellon drill
  'drl', 'drd', 'xln', 'txt', 'tap', 'nc',
]

const GERBER_HEADER_PATTERNS = [
  /^G04 /m,
  /^%FS[LT][AI]/m,
  /^%MO(IN|MM)/m,
  /^%AD/m,
  /^M48/m, // Excellon header
]

// Module-scoped cache for sibling-fetch results, keyed by repo+ref+dir.
// This avoids re-fetching the directory listing and re-parsing on Turbo
// navigation between files in the same folder.
const stackupCache = new Map()

function getPathInfo() {
  const m = window.location.pathname.match(/^\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/)
  if (!m) return null
  const [, owner, repo, ref, filepath] = m
  return {
    owner,
    repo,
    ref,
    filepath,
    filename: filepath.split('/').pop(),
    dir: filepath.includes('/') ? filepath.substring(0, filepath.lastIndexOf('/')) : '',
    rawUrl: `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${filepath}`,
  }
}

function looksLikeGerberByName(filename) {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (!ext) return false
  if (GERBER_EXTENSIONS.includes(ext)) return true
  const id = whatsThatGerber([filename])[filename]
  return Boolean(id && id.type)
}

function looksLikeGerberByContent(text) {
  if (!text) return false
  const head = text.slice(0, 4096)
  return GERBER_HEADER_PATTERNS.some((rx) => rx.test(head))
}

// Distinguish drill from gerber by content. whats-that-gerber relies on
// filenames, which mis-classifies common drill extensions (notably .drd from
// Eagle) as outline layers. M48 in the header is the canonical Excellon
// marker; %FS and %MO are the canonical Gerber RS-274X markers.
function sniffFiletype(text) {
  if (!text) return null
  const head = text.slice(0, 4096)
  if (/^M48/m.test(head)) return 'drill'
  if (/^%FS[LT][AI]/m.test(head) || /^%MO(IN|MM)/m.test(head)) return 'gerber'
  return null
}

async function fetchRaw(rawUrl) {
  const res = await fetch(rawUrl, { credentials: 'omit' })
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
  return res.text()
}

async function fetchDirListing(info) {
  const url = `https://api.github.com/repos/${info.owner}/${info.repo}/contents/${info.dir}?ref=${encodeURIComponent(info.ref)}`
  const res = await fetch(url, {
    credentials: 'omit',
    headers: { 'Accept': 'application/vnd.github.v3+json' },
  })
  if (!res.ok) {
    if (res.status === 403) {
      throw new Error('GitHub API rate-limited (60/hr unauthenticated)')
    }
    throw new Error(`Directory listing failed: ${res.status}`)
  }
  return res.json()
}

function ensureStyles() {
  if (document.getElementById('ghgv-styles')) return
  const style = document.createElement('style')
  style.id = 'ghgv-styles'
  style.textContent = `
    .ghgv-panel {
      border: 1px solid var(--borderColor-default, #d0d7de);
      border-radius: 6px;
      margin: 16px 0;
      background: var(--bgColor-muted, #f6f8fa);
      overflow: hidden;
    }
    .ghgv-toolbar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-bottom: 1px solid var(--borderColor-default, #d0d7de);
      background: var(--bgColor-default, #ffffff);
      font-size: 12px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      flex-wrap: wrap;
    }
    .ghgv-toolbar .ghgv-title {
      font-weight: 600;
    }
    .ghgv-toolbar .ghgv-meta {
      color: var(--fgColor-muted, #656d76);
      font-family: ui-monospace, SFMono-Regular, monospace;
    }
    .ghgv-spacer { flex: 1; }
    .ghgv-btn {
      border: 1px solid var(--borderColor-default, #d0d7de);
      background: var(--bgColor-default, #ffffff);
      color: var(--fgColor-default, #1f2328);
      border-radius: 6px;
      padding: 4px 10px;
      font-size: 12px;
      cursor: pointer;
    }
    .ghgv-btn:hover:not(:disabled) {
      background: var(--bgColor-muted, #f6f8fa);
    }
    .ghgv-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .ghgv-btn.ghgv-active {
      background: #0969da;
      color: #ffffff;
      border-color: #0969da;
    }
    .ghgv-tabs {
      display: inline-flex;
      gap: 0;
      margin-right: 6px;
    }
    .ghgv-tabs .ghgv-btn {
      border-radius: 0;
      border-right-width: 0;
    }
    .ghgv-tabs .ghgv-btn:first-child { border-radius: 6px 0 0 6px; }
    .ghgv-tabs .ghgv-btn:last-child {
      border-radius: 0 6px 6px 0;
      border-right-width: 1px;
    }
    .ghgv-status {
      color: var(--fgColor-muted, #656d76);
      font-size: 11px;
      font-style: italic;
    }
    .ghgv-stage {
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      max-height: 75vh;
      overflow: auto;
      background:
        repeating-conic-gradient(#e6e6e6 0% 25%, transparent 0% 50%) 50% / 16px 16px;
    }
    .ghgv-stage svg {
      max-width: 100%;
      max-height: 70vh;
      display: block;
      cursor: grab;
      user-select: none;
      touch-action: none;
    }
    .ghgv-stage svg.ghgv-grabbing {
      cursor: grabbing;
    }
    .ghgv-zoom {
      display: inline-flex;
      gap: 0;
      margin-right: 6px;
    }
    .ghgv-zoom .ghgv-btn {
      border-radius: 0;
      border-right-width: 0;
      min-width: 28px;
      padding: 4px 8px;
      font-family: ui-monospace, SFMono-Regular, monospace;
    }
    .ghgv-zoom .ghgv-btn:first-child { border-radius: 6px 0 0 6px; }
    .ghgv-zoom .ghgv-btn:last-child {
      border-radius: 0 6px 6px 0;
      border-right-width: 1px;
    }
    .ghgv-rotate {
      display: inline-flex;
      gap: 0;
      margin-right: 6px;
    }
    .ghgv-rotate .ghgv-btn {
      border-radius: 0;
      border-right-width: 0;
      min-width: 28px;
      padding: 4px 6px;
      font-size: 14px;
    }
    .ghgv-rotate .ghgv-btn:first-child { border-radius: 6px 0 0 6px; }
    .ghgv-rotate .ghgv-btn:last-child {
      border-radius: 0 6px 6px 0;
      border-right-width: 1px;
    }
    .ghgv-credit {
      font-size: 11px;
      color: var(--fgColor-muted, #656d76);
    }
    .ghgv-credit a {
      color: var(--fgColor-accent, #0969da);
      text-decoration: none;
    }
    .ghgv-credit a:hover {
      text-decoration: underline;
    }
    .ghgv-stage.ghgv-dark {
      background:
        repeating-conic-gradient(#2a2a2a 0% 25%, #1f1f1f 0% 50%) 50% / 16px 16px;
    }
    .ghgv-error {
      color: #cf222e;
      font-family: ui-monospace, SFMono-Regular, monospace;
      font-size: 12px;
      padding: 12px 16px;
      background: #ffebe9;
      border-radius: 6px;
      margin: 8px;
    }
    .ghgv-loading {
      color: var(--fgColor-muted, #656d76);
      font-size: 13px;
    }
  `
  document.head.appendChild(style)
}

async function renderSingleLayerSvg(gerberText, isDrill) {
  return new Promise((resolve, reject) => {
    try {
      gerberToSvg(gerberText, {
        attributes: { color: '#0969da' },
        filetype: isDrill ? 'drill' : 'gerber',
      }, (err, svgString) => {
        if (err) reject(err)
        else resolve(svgString)
      })
    } catch (e) {
      reject(e)
    }
  })
}

async function buildStackup(layerInputs) {
  // pcb-stackup returns a promise when no callback is provided
  return pcbStackup(layerInputs)
}

async function loadSiblings(info) {
  const cacheKey = `${info.owner}/${info.repo}/${info.ref}/${info.dir}`
  if (stackupCache.has(cacheKey)) {
    return stackupCache.get(cacheKey)
  }

  const task = (async () => {
    const items = await fetchDirListing(info)

    // Filter to plausible Gerber/drill files. Filter out tiny files which are
    // almost certainly LFS pointers, and require either an extension match or
    // whats-that-gerber recognition.
    const candidates = items.filter((item) =>
      item.type === 'file' &&
      item.size > 200 &&
      looksLikeGerberByName(item.name)
    )

    if (candidates.length < 2) {
      return { stackup: null, reason: 'fewer than 2 Gerber-shaped files in folder' }
    }

    // Fetch each candidate's raw content in parallel and content-sniff
    const fetchedLayers = await Promise.all(
      candidates.map(async (item) => {
        try {
          const text = await fetchRaw(item.download_url)
          if (!looksLikeGerberByContent(text)) return null
          const layer = { filename: item.name, gerber: text }
          // whats-that-gerber gets some extensions wrong (notably .drd which
          // it labels as outline but is actually Excellon drill). Override
          // the type via content sniff so pcb-stackup treats drill files as
          // drill, not as additional outline geometry.
          if (sniffFiletype(text) === 'drill') {
            layer.type = 'drill'
            layer.side = 'all'
          }
          return layer
        } catch (e) {
          console.warn('[gerber-gh] sibling fetch failed for', item.name, e)
          return null
        }
      })
    )
    const validLayers = fetchedLayers.filter(Boolean)
    if (validLayers.length < 2) {
      return { stackup: null, reason: 'fewer than 2 layers passed content sniff' }
    }

    // Build the standard stackup (with whatever outline layers are present).
    // Some boards ship malformed or feature-laden outline files (text labels,
    // fiducials, milled cutouts that don't form a closed polygon), which can
    // produce a mangled board boundary. Build a parallel no-outline stackup
    // so the user can toggle between the two.
    const stackup = await buildStackup(validLayers)

    let stackupNoOutline = null
    const layersWithoutOutline = validLayers.filter((l) => {
      // Outline classification can come from our explicit override or from
      // whats-that-gerber. Skip both.
      if (l.type === 'outline') return false
      const wtg = whatsThatGerber([l.filename])[l.filename]
      return wtg?.type !== 'outline'
    })
    const hasOutline = layersWithoutOutline.length < validLayers.length
    if (hasOutline && layersWithoutOutline.length >= 2) {
      try {
        stackupNoOutline = await buildStackup(layersWithoutOutline)
      } catch (e) {
        console.warn('[gerber-gh] no-outline stackup failed', e)
      }
    }

    return {
      stackup,
      stackupNoOutline,
      hasOutline,
      layerCount: validLayers.length,
    }
  })()

  stackupCache.set(cacheKey, task)

  try {
    const result = await task
    stackupCache.set(cacheKey, Promise.resolve(result))
    return result
  } catch (e) {
    stackupCache.delete(cacheKey) // allow retry on next visit
    throw e
  }
}

// Attaches wheel-zoom and drag-pan handlers to an SVG inside `stage`.
// Returns a controller exposing reset/zoomIn/zoomOut. Uses viewBox
// manipulation, so renders stay vector-crisp at any zoom level. Safe to
// call multiple times on the same SVG: previous listeners are aborted via
// AbortController stored on the element.
function setupZoomPan(stage) {
  const svg = stage.querySelector('svg')
  if (!svg) return null

  // Clean up any prior listeners attached to this SVG.
  if (svg._ghgvAbort) svg._ghgvAbort.abort()
  const ac = new AbortController()
  svg._ghgvAbort = ac
  const { signal } = ac

  // Capture the truly-original (un-rotated, un-zoomed) viewBox once. Used
  // by the rotation logic to compute the rotated bounding box.
  if (!svg.dataset.ghgvOriginalViewBox) {
    let initialViewBox = svg.getAttribute('viewBox')
    if (!initialViewBox) {
      const w = (svg.getAttribute('width') || '').replace(/[^\d.]/g, '') || '100'
      const h = (svg.getAttribute('height') || '').replace(/[^\d.]/g, '') || '100'
      initialViewBox = `0 0 ${w} ${h}`
      svg.setAttribute('viewBox', initialViewBox)
    }
    svg.dataset.ghgvOriginalViewBox = initialViewBox
  }

  // The "fit target" for this controller is whatever the viewBox is right
  // now. After rotation, applyRotation rewrites the viewBox so the fit
  // target naturally tracks the current orientation.
  const fitViewBox = svg.getAttribute('viewBox')

  // Strip width/height so the SVG flexes to the stage. Without this,
  // viewBox changes do not produce visible zoom because explicit dimensions
  // win.
  svg.removeAttribute('width')
  svg.removeAttribute('height')
  svg.style.width = '100%'
  svg.style.height = 'auto'

  const ZOOM_FACTOR = 1.2
  const MIN_SPAN = 0.0001 // sane min viewBox span (units depend on file)
  const MAX_SPAN = 1e9    // sane max

  const parseVb = (s) => s.split(/\s+/).map(Number)
  const writeVb = (x, y, w, h) =>
    svg.setAttribute('viewBox', `${x} ${y} ${w} ${h}`)
  const readVb = () => parseVb(svg.getAttribute('viewBox'))

  function zoomAt(clientX, clientY, factor) {
    const [vbX, vbY, vbW, vbH] = readVb()
    const newW = vbW * factor
    const newH = vbH * factor
    if (newW < MIN_SPAN || newW > MAX_SPAN) return
    if (newH < MIN_SPAN || newH > MAX_SPAN) return

    const rect = svg.getBoundingClientRect()
    const cx = clientX != null ? (clientX - rect.left) / rect.width : 0.5
    const cy = clientY != null ? (clientY - rect.top) / rect.height : 0.5
    // Anchor the cursor's SVG-space point so it stays put under the cursor
    const anchorX = vbX + cx * vbW
    const anchorY = vbY + cy * vbH
    const newX = anchorX - cx * newW
    const newY = anchorY - cy * newH
    writeVb(newX, newY, newW, newH)
  }

  function reset() {
    svg.setAttribute('viewBox', fitViewBox)
  }

  // Wheel zoom (cursor-anchored)
  const onWheel = (e) => {
    e.preventDefault()
    const factor = e.deltaY < 0 ? 1 / ZOOM_FACTOR : ZOOM_FACTOR
    zoomAt(e.clientX, e.clientY, factor)
  }

  // Drag-pan
  let drag = null
  const onPointerDown = (e) => {
    if (e.button !== 0) return
    svg.setPointerCapture?.(e.pointerId)
    drag = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startVb: readVb(),
      rect: svg.getBoundingClientRect(),
    }
    svg.classList.add('ghgv-grabbing')
  }
  const onPointerMove = (e) => {
    if (!drag || drag.pointerId !== e.pointerId) return
    const [, , vbW, vbH] = drag.startVb
    const dx = (e.clientX - drag.startX) * (vbW / drag.rect.width)
    const dy = (e.clientY - drag.startY) * (vbH / drag.rect.height)
    writeVb(
      drag.startVb[0] - dx,
      drag.startVb[1] - dy,
      drag.startVb[2],
      drag.startVb[3]
    )
  }
  const onPointerUp = (e) => {
    if (!drag) return
    if (drag.pointerId === e.pointerId) {
      svg.releasePointerCapture?.(e.pointerId)
      drag = null
      svg.classList.remove('ghgv-grabbing')
    }
  }

  svg.addEventListener('wheel', onWheel, { passive: false, signal })
  svg.addEventListener('pointerdown', onPointerDown, { signal })
  svg.addEventListener('pointermove', onPointerMove, { signal })
  svg.addEventListener('pointerup', onPointerUp, { signal })
  svg.addEventListener('pointercancel', onPointerUp, { signal })

  return {
    reset,
    zoomIn: () => zoomAt(null, null, 1 / ZOOM_FACTOR),
    zoomOut: () => zoomAt(null, null, ZOOM_FACTOR),
  }
}

// Rotates the SVG content via an internal <g> wrapper plus a viewBox swap
// for 90 and 270 degrees. By doing this inside SVG coordinate space rather
// than via a CSS transform on the SVG element, the layout container reports
// the correct rotated aspect ratio, and pan/zoom continue to operate in the
// user's frame of reference (drag right pans right, regardless of rotation).
function applyRotation(stage, degrees) {
  const svg = stage.querySelector('svg')
  if (!svg) return
  const original = svg.dataset.ghgvOriginalViewBox
  if (!original) return // setupZoomPan must have run first

  const [origX, origY, origW, origH] = original.split(/\s+/).map(Number)
  const cx = origX + origW / 2
  const cy = origY + origH / 2
  const deg = ((degrees % 360) + 360) % 360

  // Locate or create the rotation wrapper. Move all existing top-level
  // children into it the first time so the transform applies to everything.
  // Defs and styles work fine inside a <g>.
  const NS = 'http://www.w3.org/2000/svg'
  let g = svg.querySelector('g[data-ghgv-rot]')
  if (!g) {
    g = svg.ownerDocument.createElementNS(NS, 'g')
    g.setAttribute('data-ghgv-rot', '1')
    while (svg.firstChild) g.appendChild(svg.firstChild)
    svg.appendChild(g)
  }

  if (deg === 0) {
    g.removeAttribute('transform')
    svg.setAttribute('viewBox', original)
  } else if (deg === 180) {
    g.setAttribute('transform', `rotate(180 ${cx} ${cy})`)
    svg.setAttribute('viewBox', original)
  } else {
    // 90 or 270: rotate around the original center, then swap the viewBox
    // dimensions so the SVG element reports the new aspect to layout.
    g.setAttribute('transform', `rotate(${deg} ${cx} ${cy})`)
    const newX = cx - origH / 2
    const newY = cy - origW / 2
    svg.setAttribute('viewBox', `${newX} ${newY} ${origH} ${origW}`)
  }
}

function makePanel({ filename, kind, layerInfo }) {
  ensureStyles()

  const panel = document.createElement('div')
  panel.className = 'ghgv-panel'
  panel.setAttribute('data-ghgv', '1')

  const toolbar = document.createElement('div')
  toolbar.className = 'ghgv-toolbar'

  const title = document.createElement('span')
  title.className = 'ghgv-title'
  title.textContent = `Gerber preview: ${filename}`

  const meta = document.createElement('span')
  meta.className = 'ghgv-meta'
  meta.textContent = layerInfo
    ? `${kind} / ${layerInfo.side ?? '?'} ${layerInfo.type ?? ''}`.trim()
    : kind

  // Tab group: Layer | Top | Bottom
  const tabs = document.createElement('span')
  tabs.className = 'ghgv-tabs'

  const layerBtn = document.createElement('button')
  layerBtn.className = 'ghgv-btn ghgv-active'
  layerBtn.textContent = 'Layer'
  layerBtn.dataset.view = 'layer'

  const topBtn = document.createElement('button')
  topBtn.className = 'ghgv-btn'
  topBtn.textContent = 'Top'
  topBtn.disabled = true
  topBtn.dataset.view = 'top'

  const bottomBtn = document.createElement('button')
  bottomBtn.className = 'ghgv-btn'
  bottomBtn.textContent = 'Bottom'
  bottomBtn.disabled = true
  bottomBtn.dataset.view = 'bottom'

  tabs.append(layerBtn, topBtn, bottomBtn)

  // Zoom controls
  const zoom = document.createElement('span')
  zoom.className = 'ghgv-zoom'
  const zoomOutBtn = document.createElement('button')
  zoomOutBtn.className = 'ghgv-btn'
  zoomOutBtn.textContent = '\u2212' // minus
  zoomOutBtn.title = 'Zoom out'
  const zoomInBtn = document.createElement('button')
  zoomInBtn.className = 'ghgv-btn'
  zoomInBtn.textContent = '+'
  zoomInBtn.title = 'Zoom in'
  const fitBtn = document.createElement('button')
  fitBtn.className = 'ghgv-btn'
  fitBtn.textContent = 'Fit'
  fitBtn.title = 'Reset zoom and pan'
  zoom.append(zoomOutBtn, zoomInBtn, fitBtn)

  // Rotate controls (90 degree intervals)
  const rotate = document.createElement('span')
  rotate.className = 'ghgv-rotate'
  const rotateLeftBtn = document.createElement('button')
  rotateLeftBtn.className = 'ghgv-btn'
  rotateLeftBtn.textContent = '\u21BA' // anticlockwise open arrow
  rotateLeftBtn.title = 'Rotate 90\u00B0 counter-clockwise'
  const rotateRightBtn = document.createElement('button')
  rotateRightBtn.className = 'ghgv-btn'
  rotateRightBtn.textContent = '\u21BB' // clockwise open arrow
  rotateRightBtn.title = 'Rotate 90\u00B0 clockwise'
  rotate.append(rotateLeftBtn, rotateRightBtn)

  const status = document.createElement('span')
  status.className = 'ghgv-status'

  const spacer = document.createElement('span')
  spacer.className = 'ghgv-spacer'

  const themeBtn = document.createElement('button')
  themeBtn.className = 'ghgv-btn'
  themeBtn.textContent = 'Invert'

  const outlineBtn = document.createElement('button')
  outlineBtn.className = 'ghgv-btn ghgv-active'
  outlineBtn.textContent = 'Outline'
  outlineBtn.title = 'Use the board outline file. Disable if the board edge looks wrong.'
  outlineBtn.disabled = true // enabled when stackup loads and an outline exists

  const downloadBtn = document.createElement('button')
  downloadBtn.className = 'ghgv-btn'
  downloadBtn.textContent = 'Download SVG'

  const toggleBtn = document.createElement('button')
  toggleBtn.className = 'ghgv-btn'
  toggleBtn.textContent = 'Hide'

  const credit = document.createElement('span')
  credit.className = 'ghgv-credit'
  const creditLink = document.createElement('a')
  creditLink.href = 'https://greenshoegarage.com'
  creditLink.target = '_blank'
  creditLink.rel = 'noopener noreferrer'
  creditLink.textContent = 'Green Shoe Garage'
  credit.append(creditLink)

  toolbar.append(title, meta, tabs, zoom, rotate, status, spacer, credit, outlineBtn, themeBtn, downloadBtn, toggleBtn)

  const stage = document.createElement('div')
  stage.className = 'ghgv-stage'
  stage.innerHTML = '<span class="ghgv-loading">Rendering...</span>'

  panel.append(toolbar, stage)

  // Per-panel state
  const views = {
    layer: null,        // SVG string for the single layer
    top: null,          // SVG string for top stackup (current outline mode)
    bottom: null,       // SVG string for bottom stackup (current outline mode)
  }
  // Two snapshots of the multi-layer renders, one with outline included and
  // one without. The Outline toggle picks which set populates views.top/.bottom.
  const stackupVariants = {
    withOutline: null,  // { top, bottom }
    noOutline: null,    // { top, bottom }
  }
  let outlineEnabled = true
  let currentView = 'layer'
  let rotation = 0
  let zoomController = null

  function applyOutlineMode() {
    const variant = outlineEnabled
      ? (stackupVariants.withOutline || stackupVariants.noOutline)
      : (stackupVariants.noOutline || stackupVariants.withOutline)
    if (!variant) return
    views.top = variant.top
    views.bottom = variant.bottom
    if (currentView === 'top' || currentView === 'bottom') {
      showView(currentView)
    }
  }

  function showView(viewName) {
    if (!views[viewName]) return
    currentView = viewName
    rotation = 0  // each view starts at the natural orientation
    stage.innerHTML = views[viewName]
    // Re-apply invert if active
    const svg = stage.querySelector('svg')
    if (svg && stage.classList.contains('ghgv-dark')) {
      svg.style.filter = 'invert(1) hue-rotate(180deg)'
    }
    // Wire up zoom/pan on the freshly inserted SVG
    zoomController = setupZoomPan(stage)
    for (const btn of [layerBtn, topBtn, bottomBtn]) {
      btn.classList.toggle('ghgv-active', btn.dataset.view === viewName)
    }
  }

  function rotateBy(delta) {
    rotation = ((rotation + delta) % 360 + 360) % 360
    applyRotation(stage, rotation)
    // Re-snapshot the fit target so the Fit button now resets to the
    // current rotation's natural bounds rather than the un-rotated bounds.
    zoomController = setupZoomPan(stage)
  }

  for (const btn of [layerBtn, topBtn, bottomBtn]) {
    btn.addEventListener('click', () => {
      if (btn.disabled) return
      showView(btn.dataset.view)
    })
  }

  zoomInBtn.addEventListener('click', () => zoomController?.zoomIn())
  zoomOutBtn.addEventListener('click', () => zoomController?.zoomOut())
  fitBtn.addEventListener('click', () => zoomController?.reset())

  rotateLeftBtn.addEventListener('click', () => rotateBy(-90))
  rotateRightBtn.addEventListener('click', () => rotateBy(90))

  outlineBtn.addEventListener('click', () => {
    if (outlineBtn.disabled) return
    outlineEnabled = !outlineEnabled
    outlineBtn.classList.toggle('ghgv-active', outlineEnabled)
    applyOutlineMode()
  })

  themeBtn.addEventListener('click', () => {
    stage.classList.toggle('ghgv-dark')
    const svg = stage.querySelector('svg')
    if (svg) {
      const inverted = stage.classList.contains('ghgv-dark')
      svg.style.filter = inverted ? 'invert(1) hue-rotate(180deg)' : ''
    }
  })

  downloadBtn.addEventListener('click', () => {
    const svg = stage.querySelector('svg')
    if (!svg) return
    const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const suffix = currentView === 'layer' ? '' : `-${currentView}`
    a.download = `${filename}${suffix}.svg`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  })

  toggleBtn.addEventListener('click', () => {
    if (stage.style.display === 'none') {
      stage.style.display = ''
      toggleBtn.textContent = 'Hide'
    } else {
      stage.style.display = 'none'
      toggleBtn.textContent = 'Show'
    }
  })

  return {
    panel,
    stage,
    status,
    setLayerSvg(svg) {
      views.layer = svg
      showView('layer')
    },
    enableStackup({ withOutline, noOutline, layerCount, hasOutline }) {
      stackupVariants.withOutline = withOutline
      stackupVariants.noOutline = noOutline
      // Pick the default variant. If we have both, start with outline on
      // (matches v0.2 behavior). If only one is available, use that one.
      outlineEnabled = Boolean(withOutline)
      outlineBtn.classList.toggle('ghgv-active', outlineEnabled)
      // Enable the Outline toggle only when both variants exist, since
      // toggling has no effect otherwise.
      outlineBtn.disabled = !(withOutline && noOutline)
      applyOutlineMode()
      topBtn.disabled = false
      bottomBtn.disabled = false
      const note = hasOutline && !noOutline
        ? `${layerCount} layers loaded`
        : hasOutline
        ? `${layerCount} layers loaded (toggle Outline if edges look wrong)`
        : `${layerCount} layers loaded (no outline file)`
      status.textContent = note
    },
    setStatus(msg) {
      status.textContent = msg
    },
  }
}

function renderError(stage, message) {
  stage.innerHTML = ''
  const err = document.createElement('div')
  err.className = 'ghgv-error'
  err.textContent = message
  stage.appendChild(err)
}

function findInsertionTarget() {
  const reactRoot = document.querySelector('react-app[app-name="react-code-view"]')
  if (reactRoot) return reactRoot
  const classicBox = document.querySelector('.repository-content .Box.mt-3.position-relative')
    || document.querySelector('.repository-content .Box.mt-3')
    || document.querySelector('.repository-content')
  if (classicBox) return classicBox
  return document.querySelector('main') || document.body
}

async function activate() {
  const info = getPathInfo()
  if (!info) return
  if (!looksLikeGerberByName(info.filename)) return
  if (document.querySelector('[data-ghgv="1"]')) return

  let text
  try {
    text = await fetchRaw(info.rawUrl)
  } catch (e) {
    console.warn('[gerber-gh] fetch failed', e)
    return
  }

  const ext = info.filename.split('.').pop()?.toLowerCase()
  const ambiguous = ['txt', 'tap', 'nc'].includes(ext)
  if (ambiguous && !looksLikeGerberByContent(text)) return

  const layerInfo = whatsThatGerber([info.filename])[info.filename] || null
  // Trust the content sniff over whats-that-gerber's filename guess. WTG
  // mis-classifies a few common drill extensions (.drd in particular).
  const sniffed = sniffFiletype(text)
  const isDrill = sniffed === 'drill' || layerInfo?.type === 'drill'
  const kind = isDrill ? 'drill' : 'gerber'

  const panel = makePanel({ filename: info.filename, kind, layerInfo })
  const target = findInsertionTarget()
  target.insertBefore(panel.panel, target.firstChild)

  // Render the single layer first (fast path)
  try {
    const svg = await renderSingleLayerSvg(text, isDrill)
    panel.setLayerSvg(svg)
  } catch (e) {
    console.warn('[gerber-gh] single-layer render failed', e)
    renderError(panel.stage, `Render failed: ${e.message || e}`)
    return
  }

  // Then attempt to load siblings and build top/bottom composite
  panel.setStatus('Loading sibling layers...')
  try {
    const result = await loadSiblings(info)
    if (!result || !result.stackup) {
      panel.setStatus(result?.reason
        ? `No multi-layer view (${result.reason})`
        : 'No multi-layer view available')
      return
    }
    panel.enableStackup({
      withOutline: {
        top: result.stackup.top.svg,
        bottom: result.stackup.bottom.svg,
      },
      noOutline: result.stackupNoOutline ? {
        top: result.stackupNoOutline.top.svg,
        bottom: result.stackupNoOutline.bottom.svg,
      } : null,
      layerCount: result.layerCount,
      hasOutline: result.hasOutline,
    })
  } catch (e) {
    console.warn('[gerber-gh] stackup failed', e)
    panel.setStatus(`Multi-layer unavailable: ${e.message || e}`)
  }
}

let lastUrl = location.href
function watchNavigation() {
  const obs = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href
      setTimeout(activate, 100)
    }
  })
  obs.observe(document.body, { childList: true, subtree: true })

  document.addEventListener('turbo:render', () => setTimeout(activate, 100))
  document.addEventListener('turbo:load', () => setTimeout(activate, 100))
  window.addEventListener('popstate', () => setTimeout(activate, 100))
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    activate()
    watchNavigation()
  })
} else {
  activate()
  watchNavigation()
}
