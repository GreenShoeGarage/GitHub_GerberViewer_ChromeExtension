// Panel UI component. Self-contained: emits a DOM tree with a toolbar and
// stage, and exposes methods to swap SVG content (Layer / Top / Bottom)
// and toggle outline mode.

import { attachMeasureTool } from './measure.js'
import { attachShortcuts } from './shortcuts.js'
import { makeLayerToggleController, buildLayerToggleMenu } from './layer-toggles.js'

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
      position: relative;
      background:
        repeating-conic-gradient(#e6e6e6 0% 25%, transparent 0% 50%) 50% / 16px 16px;
    }
    .ghgv-zoom-hint {
      position: absolute;
      top: 12px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 20, 25, 0.82);
      color: #ffffff;
      padding: 6px 14px;
      border-radius: 6px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 12px;
      font-weight: 500;
      pointer-events: none;
      z-index: 10;
      opacity: 1;
      transition: opacity 0.5s ease-out;
    }
    .ghgv-zoom-hint-fade {
      opacity: 0;
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
    .ghgv-help-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 20, 25, 0.55);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(2px);
      animation: ghgv-fade-in 0.12s ease-out;
    }
    @keyframes ghgv-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .ghgv-help-card {
      background: #ffffff;
      color: #1f2328;
      border: 1px solid #d0d7de;
      border-radius: 10px;
      max-width: 540px;
      width: calc(100% - 32px);
      padding: 24px 28px 20px;
      box-shadow: 0 16px 48px rgba(0,0,0,0.18);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .ghgv-help-heading {
      margin: 0 0 16px;
      font-size: 16px;
      font-weight: 600;
      color: #0e7c3a;
    }
    .ghgv-help-list {
      margin: 0 0 16px;
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 6px 16px;
      align-items: baseline;
    }
    .ghgv-help-list dt {
      margin: 0;
    }
    .ghgv-help-list dt kbd {
      display: inline-block;
      min-width: 28px;
      padding: 2px 8px;
      text-align: center;
      background: #f6f8fa;
      border: 1px solid #d0d7de;
      border-bottom-width: 2px;
      border-radius: 4px;
      font-family: ui-monospace, SFMono-Regular, monospace;
      font-size: 11px;
      color: #1f2328;
    }
    .ghgv-help-list dd {
      margin: 0;
      font-size: 13px;
      line-height: 1.4;
      color: #1f2328;
    }
    .ghgv-help-tip {
      margin: 0 0 16px;
      padding: 10px 12px;
      background: #f6f8fa;
      border-left: 3px solid #0e7c3a;
      border-radius: 4px;
      font-size: 12px;
      line-height: 1.5;
      color: #656d76;
    }
    .ghgv-help-close {
      display: block;
      margin: 0 0 0 auto;
      padding: 6px 14px;
      background: #0e7c3a;
      color: #ffffff;
      border: 1px solid #0e7c3a;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
    }
    .ghgv-help-close:hover {
      background: #0a5d2a;
    }
    .ghgv-layer-menu {
      background: #ffffff;
      border: 1px solid #d0d7de;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.12);
      padding: 10px 12px;
      min-width: 200px;
      z-index: 1000;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 13px;
    }
    .ghgv-layer-menu-heading {
      color: #1f2328;
      margin-bottom: 8px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    .ghgv-layer-menu-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .ghgv-layer-menu-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 0;
      cursor: pointer;
      user-select: none;
      color: #1f2328;
      font-size: 13px;
    }
    .ghgv-layer-menu-row:hover {
      background: #f6f8fa;
      border-radius: 4px;
    }
    .ghgv-layer-menu-row input[type="checkbox"] {
      cursor: pointer;
    }
    .ghgv-layer-menu-empty {
      color: #656d76;
      font-style: italic;
      padding: 4px 0;
    }
    .ghgv-layer-menu-showall {
      margin-top: 8px;
      padding: 4px 10px;
      background: transparent;
      border: 1px solid #d0d7de;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      width: 100%;
      color: #1f2328;
    }
    .ghgv-layer-menu-showall:hover {
      background: #f6f8fa;
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

  // One-time hint: the first time the user scrolls over the board without
  // a zoom modifier, briefly show "Hold Cmd/Ctrl to zoom" so mouse users
  // who remember scroll-to-zoom aren't left confused. Shown at most once
  // per stage, fades on its own.
  let hintShown = false
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent || '')
  function showZoomHint() {
    if (hintShown) return
    hintShown = true
    const hint = document.createElement('div')
    hint.className = 'ghgv-zoom-hint'
    hint.textContent = isMac ? 'Hold \u2318 Cmd and scroll to zoom' : 'Hold Ctrl and scroll to zoom'
    stage.appendChild(hint)
    // Fade out after a moment, then remove.
    setTimeout(() => { hint.classList.add('ghgv-zoom-hint-fade') }, 1600)
    setTimeout(() => { if (hint.parentNode) hint.parentNode.removeChild(hint) }, 2300)
  }

  // Wheel handling distinguishes zoom gestures from plain scroll so the
  // board can live inside a long GitHub page without hijacking scroll:
  //   - Trackpad pinch sets e.ctrlKey on the synthetic wheel event (a
  //     cross-browser convention), so pinch zooms.
  //   - Held Cmd/Ctrl + wheel is explicit zoom intent, so it zooms.
  //   - Plain scroll (no modifier) passes through; the page scrolls.
  // Delta magnitude scales the zoom step so pinch is smooth and a mouse
  // notch still makes a clear step.
  const onWheel = (e) => {
    const wantsZoom = e.ctrlKey || e.metaKey
    if (!wantsZoom) {
      // Let the page scroll. Do not preventDefault. Show the hint once so
      // mouse users learn the modifier.
      showZoomHint()
      return
    }
    e.preventDefault()
    const intensity = Math.min(Math.abs(e.deltaY), 50) / 50  // 0..1
    const step = 1 + intensity * (ZOOM_FACTOR - 1)
    const factor = e.deltaY < 0 ? 1 / step : step
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

  const layersBtn = document.createElement('button')
  layersBtn.className = 'ghgv-btn'
  layersBtn.textContent = 'Layers'
  layersBtn.title = 'Toggle which layers are visible in the composite view'
  layersBtn.disabled = true

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

  toolbar.append(title, meta, tabs, zoom, rotate, measure, status, spacer, outlineBtn, layersBtn, themeBtn, downloadBtn, toggleBtn, credit)

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
  // Layer visibility controller for stackup views. Lazily created when
  // enableStackup runs since the controller needs the stage to inspect.
  let layerToggleController = null
  // Open menu element, if any. Tracked so we can dismiss-on-outside-click.
  let openLayerMenu = null

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
    // Re-apply layer visibility to the new SVG so that hiding a layer
    // persists across Top/Bottom switches. The controller reads the
    // current SVG out of the stage each time.
    if (layerToggleController) {
      layerToggleController.applyVisibility()
      // Enable the Layers button only when we're in a composite view
      // (Top, Bottom, or an inner copper view). Layer view is a single
      // raw Gerber, which doesn't have toggleable sub-layers.
      const isComposite = viewName === 'top' || viewName === 'bottom' || viewName.startsWith('inner:')
      layersBtn.disabled = !isComposite
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
  layersBtn.addEventListener('click', (e) => {
    if (layersBtn.disabled) return
    // If menu is already open, close it (toggle behavior).
    if (openLayerMenu) {
      openLayerMenu.remove()
      openLayerMenu = null
      layersBtn.classList.remove('ghgv-active')
      return
    }
    if (!layerToggleController) return
    const menu = buildLayerToggleMenu(layerToggleController)
    // Position the menu anchored under the button. Use the panel as the
    // positioning context so the menu scrolls with the page.
    const rect = layersBtn.getBoundingClientRect()
    const panelRect = panel.getBoundingClientRect()
    menu.style.position = 'absolute'
    menu.style.top = `${rect.bottom - panelRect.top + 4}px`
    menu.style.left = `${rect.left - panelRect.left}px`
    panel.appendChild(menu)
    openLayerMenu = menu
    layersBtn.classList.add('ghgv-active')
    // Dismiss on outside click; we use a capturing listener so the menu's
    // own clicks don't trigger dismissal.
    const onOutside = (evt) => {
      if (!menu.contains(evt.target) && evt.target !== layersBtn) {
        menu.remove()
        openLayerMenu = null
        layersBtn.classList.remove('ghgv-active')
        document.removeEventListener('mousedown', onOutside, true)
      }
    }
    // Defer so the click that opened the menu doesn't immediately close it
    setTimeout(() => document.addEventListener('mousedown', onOutside, true), 0)
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

  // Wire up keyboard shortcuts. Each callable triggers the same code path
  // the corresponding button click would, so the user sees consistent
  // visual feedback (active states, status updates) regardless of input
  // method.
  attachShortcuts(panel, {
    fit: () => zoomController?.reset(),
    rotateRight: () => rotateBy(90),
    rotateLeft: () => rotateBy(-90),
    toggleMeasure: () => measureBtn.click(),
    toggleUnit: () => unitBtn.click(),
    showLayer: () => { if (!layerBtn.disabled) showView('layer') },
    showTop: () => { if (!topBtn.disabled) showView('top') },
    showBottom: () => { if (!bottomBtn.disabled) showView('bottom') },
    toggleOutline: () => { if (!outlineBtn.disabled) outlineBtn.click() },
    toggleInvert: () => themeBtn.click(),
    toggleHide: () => toggleBtn.click(),
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
      // Create the layer toggle controller now that the stage has stackup
      // content. The button stays disabled in Layer view (single Gerber);
      // showView decides when to enable it.
      if (!layerToggleController) {
        layerToggleController = makeLayerToggleController(stage)
      } else {
        layerToggleController.resetVisibility()
      }
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
