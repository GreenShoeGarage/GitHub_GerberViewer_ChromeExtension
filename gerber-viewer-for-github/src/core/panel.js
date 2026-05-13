// Panel UI component. Self-contained: emits a DOM tree with a toolbar and
// stage, and exposes methods to swap SVG content (Layer / Top / Bottom)
// and toggle outline mode.

import { attachMeasureTool } from './measure.js'

const STYLE_ID = 'ghgv-styles'

export function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
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
    .ghgv-toolbar .ghgv-title { font-weight: 600; }
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
    .ghgv-btn:hover:not(:disabled) { background: var(--bgColor-muted, #f6f8fa); }
    .ghgv-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .ghgv-btn.ghgv-active {
      background: #0969da;
      color: #ffffff;
      border-color: #0969da;
    }
    .ghgv-tabs, .ghgv-zoom, .ghgv-rotate, .ghgv-measure {
      display: inline-flex;
      gap: 0;
      margin-right: 6px;
    }
    .ghgv-tabs .ghgv-btn,
    .ghgv-zoom .ghgv-btn,
    .ghgv-rotate .ghgv-btn,
    .ghgv-measure .ghgv-btn {
      border-radius: 0;
      border-right-width: 0;
    }
    .ghgv-tabs .ghgv-btn:first-child,
    .ghgv-zoom .ghgv-btn:first-child,
    .ghgv-rotate .ghgv-btn:first-child,
    .ghgv-measure .ghgv-btn:first-child { border-radius: 6px 0 0 6px; }
    .ghgv-tabs .ghgv-btn:last-child,
    .ghgv-zoom .ghgv-btn:last-child,
    .ghgv-rotate .ghgv-btn:last-child,
    .ghgv-measure .ghgv-btn:last-child {
      border-radius: 0 6px 6px 0;
      border-right-width: 1px;
    }
    .ghgv-zoom .ghgv-btn,
    .ghgv-rotate .ghgv-btn {
      min-width: 28px;
      padding: 4px 8px;
      font-family: ui-monospace, SFMono-Regular, monospace;
    }
    .ghgv-rotate .ghgv-btn { font-size: 14px; padding: 4px 6px; }
    .ghgv-status {
      color: var(--fgColor-muted, #656d76);
      font-size: 11px;
      font-style: italic;
    }
    .ghgv-credit { font-size: 11px; color: var(--fgColor-muted, #656d76); }
    .ghgv-credit a {
      color: var(--fgColor-accent, #0969da);
      text-decoration: none;
    }
    .ghgv-credit a:hover { text-decoration: underline; }
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
    .ghgv-stage svg.ghgv-grabbing { cursor: grabbing; }
    .ghgv-stage.ghgv-dark {
      background:
        repeating-conic-gradient(#2a2a2a 0% 25%, #1f1f1f 0% 50%) 50% / 16px 16px;
    }
    .ghgv-stage.ghgv-stage-kicad {
      padding: 0;
      background: #1a1a1a;
      min-height: 500px;
      max-height: 75vh;
      height: 600px;
      overflow: hidden;
    }
    .ghgv-stage.ghgv-stage-kicad kicanvas-embed {
      width: 100%;
      height: 100%;
      display: block;
    }
    .ghgv-error {
      color: #1f2328;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 13px;
      padding: 20px 24px;
      background: #fff8f7;
      border: 1px solid #ffc1bc;
      border-radius: 6px;
      margin: 16px;
      max-width: 680px;
      line-height: 1.5;
    }
    .ghgv-error-heading {
      color: #cf222e;
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 8px;
    }
    .ghgv-error-detail {
      margin: 0 0 12px 0;
      color: #1f2328;
    }
    .ghgv-error-suggestion {
      margin: 0 0 12px 0;
      color: #656d76;
    }
    .ghgv-error-link {
      margin: 0;
    }
    .ghgv-error-link a {
      color: #0969da;
      text-decoration: none;
      font-weight: 500;
    }
    .ghgv-error-link a:hover {
      text-decoration: underline;
    }
    .ghgv-loading {
      color: var(--fgColor-muted, #656d76);
      font-size: 13px;
    }
  `
  document.head.appendChild(style)
}

// Attaches wheel-zoom and drag-pan handlers to an SVG inside `stage`.
// Safe to call multiple times: aborts prior listeners via AbortController.
export function setupZoomPan(stage) {
  const svg = stage.querySelector('svg')
  if (!svg) return null

  if (svg._ghgvAbort) svg._ghgvAbort.abort()
  const ac = new AbortController()
  svg._ghgvAbort = ac
  const { signal } = ac

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

  const fitViewBox = svg.getAttribute('viewBox')
  // Cache the original width/height before stripping so the measure tool
  // (and any other consumer) can still derive physical-unit calibration.
  if (!svg.dataset.ghgvOriginalWidth && svg.getAttribute('width')) {
    svg.dataset.ghgvOriginalWidth = svg.getAttribute('width')
  }
  if (!svg.dataset.ghgvOriginalHeight && svg.getAttribute('height')) {
    svg.dataset.ghgvOriginalHeight = svg.getAttribute('height')
  }
  svg.removeAttribute('width')
  svg.removeAttribute('height')
  svg.style.width = '100%'
  svg.style.height = 'auto'

  const ZOOM_FACTOR = 1.2
  const MIN_SPAN = 0.0001
  const MAX_SPAN = 1e9

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
    const anchorX = vbX + cx * vbW
    const anchorY = vbY + cy * vbH
    writeVb(anchorX - cx * newW, anchorY - cy * newH, newW, newH)
  }

  function reset() { svg.setAttribute('viewBox', fitViewBox) }

  const onWheel = (e) => {
    e.preventDefault()
    const factor = e.deltaY < 0 ? 1 / ZOOM_FACTOR : ZOOM_FACTOR
    zoomAt(e.clientX, e.clientY, factor)
  }

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
    writeVb(drag.startVb[0] - dx, drag.startVb[1] - dy, drag.startVb[2], drag.startVb[3])
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

export function applyRotation(stage, degrees) {
  const svg = stage.querySelector('svg')
  if (!svg) return
  const original = svg.dataset.ghgvOriginalViewBox
  if (!original) return

  const [origX, origY, origW, origH] = original.split(/\s+/).map(Number)
  const cx = origX + origW / 2
  const cy = origY + origH / 2
  const deg = ((degrees % 360) + 360) % 360

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
    g.setAttribute('transform', `rotate(${deg} ${cx} ${cy})`)
    const newX = cx - origH / 2
    const newY = cy - origW / 2
    svg.setAttribute('viewBox', `${newX} ${newY} ${origH} ${origW}`)
  }
}

// Render an error into a panel stage. Accepts either a string (legacy
// callers passing a single line of text) or a structured error object
// from core/errors.js. The structured form produces a heading, optional
// detail and suggestion paragraphs, and a "View raw file" link where
// applicable.
export function renderError(stage, errorOrMessage) {
  stage.innerHTML = ''
  // Reset stage classes that other renderers may have applied.
  stage.classList.remove('ghgv-stage-kicad')

  const wrap = document.createElement('div')
  wrap.className = 'ghgv-error'

  if (typeof errorOrMessage === 'string') {
    // Legacy single-string form. Keep working so we don't break older
    // call sites that haven't migrated to structured errors yet.
    wrap.textContent = errorOrMessage
    stage.appendChild(wrap)
    return
  }

  const e = errorOrMessage || {}
  const heading = document.createElement('div')
  heading.className = 'ghgv-error-heading'
  heading.textContent = e.summary || 'Something went wrong'
  wrap.appendChild(heading)

  if (e.detail) {
    const detail = document.createElement('p')
    detail.className = 'ghgv-error-detail'
    detail.textContent = e.detail
    wrap.appendChild(detail)
  }

  if (e.suggestion) {
    const suggestion = document.createElement('p')
    suggestion.className = 'ghgv-error-suggestion'
    suggestion.textContent = e.suggestion
    wrap.appendChild(suggestion)
  }

  if (e.rawUrl) {
    const linkPara = document.createElement('p')
    linkPara.className = 'ghgv-error-link'
    const link = document.createElement('a')
    link.href = e.rawUrl
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    link.textContent = 'View raw file on GitHub \u2192'
    linkPara.appendChild(link)
    wrap.appendChild(linkPara)
  }

  stage.appendChild(wrap)
}

// Build a panel. `mode` is 'blob' (Layer/Top/Bottom tabs) or 'tree' (Top/Bottom only).
// `settings` is an optional object with user preference defaults (see core/settings.js).
export function makePanel({ filename, kind, layerInfo, mode = 'blob', metaOverride = null, settings = null }) {
  ensureStyles()

  const panel = document.createElement('div')
  panel.className = 'ghgv-panel'
  panel.setAttribute('data-ghgv', '1')

  const toolbar = document.createElement('div')
  toolbar.className = 'ghgv-toolbar'

  const title = document.createElement('span')
  title.className = 'ghgv-title'
  title.textContent = mode === 'tree'
    ? `PCB preview: ${filename || 'folder'}`
    : `Gerber preview: ${filename}`

  const meta = document.createElement('span')
  meta.className = 'ghgv-meta'
  if (mode === 'blob') {
    // Prefer the X2-derived summary if the file declared one (it reflects
    // the file's own metadata rather than a filename-based guess).
    if (metaOverride) {
      meta.textContent = metaOverride
    } else {
      meta.textContent = layerInfo
        ? `${kind} / ${layerInfo.side ?? '?'} ${layerInfo.type ?? ''}`.trim()
        : kind
    }
  }

  // Tab group
  const tabs = document.createElement('span')
  tabs.className = 'ghgv-tabs'

  const layerBtn = document.createElement('button')
  layerBtn.className = 'ghgv-btn'
  layerBtn.textContent = 'Layer'
  layerBtn.dataset.view = 'layer'
  layerBtn.disabled = mode !== 'blob'

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

  if (mode === 'blob') {
    layerBtn.classList.add('ghgv-active')
    tabs.append(layerBtn, topBtn, bottomBtn)
  } else {
    // Tree mode: no Layer tab, Top is default
    topBtn.classList.add('ghgv-active')
    tabs.append(topBtn, bottomBtn)
  }

  // Zoom controls
  const zoom = document.createElement('span')
  zoom.className = 'ghgv-zoom'
  const zoomOutBtn = document.createElement('button')
  zoomOutBtn.className = 'ghgv-btn'
  zoomOutBtn.textContent = '\u2212'
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

  // Rotate controls
  const rotate = document.createElement('span')
  rotate.className = 'ghgv-rotate'
  const rotateLeftBtn = document.createElement('button')
  rotateLeftBtn.className = 'ghgv-btn'
  rotateLeftBtn.textContent = '\u21BA'
  rotateLeftBtn.title = 'Rotate 90\u00B0 counter-clockwise'
  const rotateRightBtn = document.createElement('button')
  rotateRightBtn.className = 'ghgv-btn'
  rotateRightBtn.textContent = '\u21BB'
  rotateRightBtn.title = 'Rotate 90\u00B0 clockwise'
  rotate.append(rotateLeftBtn, rotateRightBtn)

  // Measure controls (Measure toggle + unit picker)
  const measure = document.createElement('span')
  measure.className = 'ghgv-measure'
  const measureBtn = document.createElement('button')
  measureBtn.className = 'ghgv-btn'
  measureBtn.textContent = 'Measure'
  measureBtn.title = 'Click two points to measure distance (Esc to exit)'
  const unitBtn = document.createElement('button')
  unitBtn.className = 'ghgv-btn'
  // Initial unit label comes from settings; the let-declared measureUnit
  // variable below is initialized from the same logic and stays in sync.
  unitBtn.textContent = (settings && settings.defaultUnit === 'mil') ? 'mil' : 'mm'
  unitBtn.title = 'Toggle measurement units (mm / mil)'
  measure.append(measureBtn, unitBtn)

  const status = document.createElement('span')
  status.className = 'ghgv-status'

  const spacer = document.createElement('span')
  spacer.className = 'ghgv-spacer'

  const themeBtn = document.createElement('button')
  themeBtn.className = 'ghgv-btn'
  themeBtn.textContent = 'Invert'
  // Apply default-invert preference: if enabled, start in dark mode.
  // (The actual stage class application happens after the stage is built.)

  const outlineBtn = document.createElement('button')
  // Initial outline-active state from settings; the outlineEnabled variable
  // below is initialized from the same logic and stays in sync.
  outlineBtn.className = (settings && settings.defaultOutline === false) ? 'ghgv-btn' : 'ghgv-btn ghgv-active'
  outlineBtn.textContent = 'Outline'
  outlineBtn.title = 'Use the board outline file. Disable if the board edge looks wrong.'
  outlineBtn.disabled = true

  const downloadBtn = document.createElement('button')
  downloadBtn.className = 'ghgv-btn'
  downloadBtn.textContent = 'Download SVG'

  const toggleBtn = document.createElement('button')
  toggleBtn.className = 'ghgv-btn'
  toggleBtn.textContent = 'Hide'

  const credit = document.createElement('span')
  credit.className = 'ghgv-credit'
  const creditLink = document.createElement('a')
  creditLink.href = 'https://github.com/GreenShoeGarage/GitHub_GerberViewer_ChromeExtension'
  creditLink.target = '_blank'
  creditLink.rel = 'noopener noreferrer'
  creditLink.textContent = 'Green Shoe Garage'
  credit.append(creditLink)

  toolbar.append(title, meta, tabs, zoom, rotate, measure, status, spacer, outlineBtn, themeBtn, downloadBtn, toggleBtn, credit)

  const stage = document.createElement('div')
  stage.className = 'ghgv-stage'
  stage.innerHTML = '<span class="ghgv-loading">Loading...</span>'
  // Apply default-invert preference. The class makes the SVG render with
  // an inverted color filter; we also mark the theme button active.
  if (settings && settings.defaultInvert) {
    stage.classList.add('ghgv-dark')
    themeBtn.classList.add('ghgv-active')
  }

  panel.append(toolbar, stage)

  // Apply start-collapsed preference. We do this after panel.append so
  // the stage exists, then flip its display and update the button label.
  if (settings && settings.startCollapsed) {
    stage.style.display = 'none'
    toggleBtn.textContent = 'Show'
  }

  // Per-panel state
  const views = { layer: null, top: null, bottom: null }
  const stackupVariants = { withOutline: null, noOutline: null }
  // Inner-layer tab buttons (created lazily when inner layers are loaded).
  // Each entry: { btn, viewName }. Inner layer views go into the views map
  // under keys like 'inner:0', 'inner:1', ... so they coexist with the
  // canonical top/bottom/layer keys.
  let innerTabBtns = []
  // User-preference defaults if provided; sensible hard-coded defaults
  // otherwise. Read directly from settings (which may be null in tests).
  let outlineEnabled = settings && settings.defaultOutline !== undefined
    ? Boolean(settings.defaultOutline) : true
  let currentView = mode === 'blob' ? 'layer' : 'top'
  let rotation = 0
  let zoomController = null
  // Measure tool: re-attached every time the SVG changes (view switch).
  // measureUnit is panel-level so it persists across view switches.
  let measureTool = null
  let measureUnit = (settings && settings.defaultUnit === 'mil') ? 'mil' : 'mm'
  // The panel's pre-measurement status text. While measure mode is active
  // the tool overwrites status; we restore this when measure exits.
  let persistentStatus = ''

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
    rotation = 0
    // Exit measure mode on view switch since the SVG element is being
    // replaced; the controller would be holding a stale reference.
    if (measureTool) measureTool.deactivate()
    measureBtn.classList.remove('ghgv-active')
    stage.innerHTML = views[viewName]
    const svg = stage.querySelector('svg')
    if (svg && stage.classList.contains('ghgv-dark')) {
      svg.style.filter = 'invert(1) hue-rotate(180deg)'
    }
    zoomController = setupZoomPan(stage)
    measureTool = attachMeasureTool(stage, {
      onStatus: (msg) => {
        if (msg) status.textContent = msg
        else status.textContent = persistentStatus
      },
    })
    measureTool.setUnit(measureUnit)
    measureBtn.disabled = !measureTool.isAvailable()
    const allTabs = [layerBtn, topBtn, bottomBtn, ...innerTabBtns.map((t) => t.btn)]
    for (const btn of allTabs) {
      btn.classList.toggle('ghgv-active', btn.dataset.view === viewName)
    }
  }

  function rotateBy(delta) {
    rotation = ((rotation + delta) % 360 + 360) % 360
    // Rotation rewrites the viewBox; safest to exit measure mode (any in-
    // progress measurement would be in the pre-rotation frame and would
    // jump). The user can re-enter measure mode in the new orientation.
    if (measureTool && measureTool.isActive()) {
      measureTool.deactivate()
      measureBtn.classList.remove('ghgv-active')
    }
    applyRotation(stage, rotation)
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

  measureBtn.addEventListener('click', () => {
    if (!measureTool) return
    if (measureBtn.disabled) return
    if (measureTool.isActive()) {
      measureTool.deactivate()
      measureBtn.classList.remove('ghgv-active')
    } else {
      const ok = measureTool.activate()
      if (ok) measureBtn.classList.add('ghgv-active')
    }
  })

  unitBtn.addEventListener('click', () => {
    measureUnit = measureUnit === 'mm' ? 'mil' : 'mm'
    unitBtn.textContent = measureUnit
    if (measureTool) measureTool.setUnit(measureUnit)
  })
  outlineBtn.addEventListener('click', () => {
    if (outlineBtn.disabled) return
    outlineEnabled = !outlineEnabled
    outlineBtn.classList.toggle('ghgv-active', outlineEnabled)
    applyOutlineMode()
  })
  themeBtn.addEventListener('click', () => {
    stage.classList.toggle('ghgv-dark')
    const inverted = stage.classList.contains('ghgv-dark')
    themeBtn.classList.toggle('ghgv-active', inverted)
    const svg = stage.querySelector('svg')
    if (svg) {
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
    const baseName = filename || 'pcb'
    const suffix = currentView === 'layer' ? '' : `-${currentView}`
    a.download = `${baseName}${suffix}.svg`
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
    setLayerSvg(svg) {
      views.layer = svg
      showView('layer')
    },
    showLoading(msg) {
      stage.innerHTML = `<span class="ghgv-loading">${msg}</span>`
    },
    enableStackup({ withOutline, noOutline, layerCount, hasOutline, autoShow }) {
      stackupVariants.withOutline = withOutline
      stackupVariants.noOutline = noOutline
      outlineEnabled = Boolean(withOutline)
      outlineBtn.classList.toggle('ghgv-active', outlineEnabled)
      outlineBtn.disabled = !(withOutline && noOutline)
      applyOutlineMode()
      topBtn.disabled = false
      bottomBtn.disabled = false
      const note = hasOutline && !noOutline
        ? `${layerCount} layers loaded`
        : hasOutline
        ? `${layerCount} layers loaded (toggle Outline if edges look wrong)`
        : `${layerCount} layers loaded (no outline file)`
      persistentStatus = note
      status.textContent = note
      // For tree/zip mode where there's no Layer view, auto-show Top once ready
      if (autoShow && !views.layer) {
        showView('top')
      }
    },
    // Adds inner-layer tab buttons between Top and Bottom. Idempotent:
    // calling again with a different set replaces the existing tabs.
    // `layers` is an array of { label, svg, filename }.
    setInnerLayers(layers) {
      // Remove any previous inner buttons from the DOM and views map
      for (const { btn, viewName } of innerTabBtns) {
        btn.remove()
        delete views[viewName]
      }
      innerTabBtns = []
      if (!layers || layers.length === 0) return

      // Insert each new inner button right before bottomBtn, in order, so
      // the tab strip reads Layer | Top | In1 | In2 | ... | Bottom.
      for (let i = 0; i < layers.length; i++) {
        const layer = layers[i]
        const viewName = `inner:${i}`
        views[viewName] = layer.svg

        const btn = document.createElement('button')
        btn.className = 'ghgv-btn'
        btn.textContent = layer.label
        btn.title = `Inner copper layer (${layer.filename})`
        btn.dataset.view = viewName
        btn.addEventListener('click', () => {
          if (btn.disabled) return
          showView(viewName)
        })
        tabs.insertBefore(btn, bottomBtn)
        innerTabBtns.push({ btn, viewName })
      }
    },
    setStatus(msg) {
      persistentStatus = msg
      status.textContent = msg
    },
    setError(msg) { renderError(stage, msg) },
  }
}
