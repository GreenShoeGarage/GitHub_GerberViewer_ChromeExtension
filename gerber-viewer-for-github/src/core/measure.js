// Dimension measurement tool. Self-contained: attaches to a stage element
// containing an SVG, lets the user click two points, and reports the
// distance in mil or mm. The measurement overlay is drawn into the SVG
// itself so it tracks zoom, pan, and rotation naturally.
//
// Coordinate model
// ----------------
// gerber-to-svg and pcb-stackup emit SVGs with `viewBox` in arbitrary
// internal units and `width`/`height` declared in physical units (e.g.
// "2.7in" or "70mm"). The internal-units-per-physical-unit ratio is fixed
// for a given SVG, so we capture it once at attach time. Click points
// arrive in screen pixels; we convert through the SVG's current bounding
// rect and viewBox to internal units, then divide by the ratio to get
// physical units. This works correctly under zoom (which rewrites the
// viewBox), pan (likewise), and rotation (which swaps viewBox dimensions
// but preserves the ratio).

const NS = 'http://www.w3.org/2000/svg'
const MM_PER_INCH = 25.4

// Parse "2.7in", "70mm", "100" into { value, unit } where unit is 'in' or
// 'mm'. Returns null on unparseable input.
function parsePhysical(str) {
  if (!str) return null
  const m = String(str).trim().match(/^([\d.]+)\s*(in|mm|cm|pt|pc|px)?$/i)
  if (!m) return null
  const value = parseFloat(m[1])
  if (!isFinite(value)) return null
  const unit = (m[2] || 'px').toLowerCase()
  // Normalize to mm
  if (unit === 'in') return { mm: value * MM_PER_INCH }
  if (unit === 'mm') return { mm: value }
  if (unit === 'cm') return { mm: value * 10 }
  // pt/pc/px: tracespace doesn't emit these for Gerber output, so treat as
  // a missing physical unit and return null. The caller will fall back to
  // "no calibration" mode.
  return null
}

// Read internal-units-per-mm from an SVG. Returns null if the SVG lacks
// proper width/height attributes (in which case measurement is disabled
// and we still allow the rest of the panel to function).
function getCalibration(svg) {
  // Use the *original* viewBox + width/height, captured before zoom/pan
  // started rewriting them. setupZoomPan stashes the original viewBox in
  // dataset.ghgvOriginalViewBox.
  const originalVb = svg.dataset.ghgvOriginalViewBox
  // Width/height get stripped during zoom setup, so look at dataset cache too
  const widthAttr = svg.dataset.ghgvOriginalWidth
  const heightAttr = svg.dataset.ghgvOriginalHeight
  if (!originalVb || !widthAttr) return null
  const physWidth = parsePhysical(widthAttr)
  const physHeight = parsePhysical(heightAttr)
  if (!physWidth) return null
  const [, , vbW, vbH] = originalVb.split(/\s+/).map(Number)
  if (!vbW || !vbH) return null
  const unitsPerMmX = vbW / physWidth.mm
  const unitsPerMmY = physHeight ? vbH / physHeight.mm : unitsPerMmX
  // In practice the X and Y ratios are identical for tracespace output;
  // if they diverged it would suggest a non-uniform scale, in which case
  // we'd average rather than pick one.
  return (unitsPerMmX + unitsPerMmY) / 2
}

// Convert a screen-space client point to viewBox coordinates. Honors the
// CTM, which automatically accounts for zoom (viewBox rewrites) and pan.
// For rotated content, the inner <g> rotation is applied separately, so
// we get the user's frame-of-reference coordinates back, which is what
// distance math needs.
function clientToSvgPoint(svg, clientX, clientY) {
  const pt = svg.createSVGPoint()
  pt.x = clientX
  pt.y = clientY
  const ctm = svg.getScreenCTM()
  if (!ctm) return null
  const inv = ctm.inverse()
  return pt.matrixTransform(inv)
}

// Format a distance in mm into a human-readable string in the requested unit.
function formatDistance(mm, unit) {
  if (unit === 'mil') {
    const mils = (mm / MM_PER_INCH) * 1000
    return mils.toFixed(2) + ' mil'
  }
  return mm.toFixed(3) + ' mm'
}

// Attach the measure tool to a stage element. Returns a controller with
// activate/deactivate/destroy and a unit-toggle. Idempotent: calling
// attach() again replaces any prior controller for the same stage.
export function attachMeasureTool(stage, opts = {}) {
  const { onStatus, onDistance } = opts
  let svg = null
  let active = false
  let unit = 'mm'
  let unitsPerMm = null
  let firstPoint = null
  let secondPoint = null
  let overlay = null

  // Track listeners with AbortController so we can tear them down cleanly
  let ac = null

  function status(msg) {
    if (onStatus) onStatus(msg)
  }

  function ensureOverlay() {
    svg = stage.querySelector('svg')
    if (!svg) return null
    let g = svg.querySelector('g[data-ghgv-measure]')
    if (g) {
      // If the overlay ended up inside a rotation wrapper (which happens
      // if the user toggled measure on, off, then rotated — applyRotation
      // sweeps all SVG children into its <g>), pull it back to the SVG
      // root so it sits in unrotated viewBox space.
      if (g.parentNode !== svg) {
        svg.appendChild(g)
      }
    } else {
      g = svg.ownerDocument.createElementNS(NS, 'g')
      g.setAttribute('data-ghgv-measure', '1')
      // Append last so it sits on top of the rotation wrapper and any
      // content beneath
      svg.appendChild(g)
    }
    overlay = g
    return g
  }

  function clearOverlay() {
    if (overlay) {
      while (overlay.firstChild) overlay.removeChild(overlay.firstChild)
    }
  }

  // Stroke widths and marker sizes need to scale with the current zoom so
  // the marks stay legibly thin no matter how zoomed in the user is. A
  // good rule: ~0.4% of the viewBox width.
  function getCurrentScale() {
    if (!svg) return 1
    const vb = svg.getAttribute('viewBox')
    if (!vb) return 1
    const [, , vbW] = vb.split(/\s+/).map(Number)
    return vbW || 1
  }

  function drawMarker(x, y) {
    const r = getCurrentScale() * 0.005
    const c = svg.ownerDocument.createElementNS(NS, 'circle')
    c.setAttribute('cx', x)
    c.setAttribute('cy', y)
    c.setAttribute('r', r)
    c.setAttribute('fill', '#cf222e')
    c.setAttribute('stroke', '#ffffff')
    c.setAttribute('stroke-width', r * 0.3)
    overlay.appendChild(c)
  }

  function drawLine(x1, y1, x2, y2, dashed = false) {
    const w = getCurrentScale() * 0.003
    const line = svg.ownerDocument.createElementNS(NS, 'line')
    line.setAttribute('x1', x1)
    line.setAttribute('y1', y1)
    line.setAttribute('x2', x2)
    line.setAttribute('y2', y2)
    line.setAttribute('stroke', '#cf222e')
    line.setAttribute('stroke-width', w)
    if (dashed) line.setAttribute('stroke-dasharray', `${w * 4} ${w * 3}`)
    line.setAttribute('stroke-linecap', 'round')
    overlay.appendChild(line)
  }

  function drawLabel(x, y, text) {
    const fontSize = getCurrentScale() * 0.025
    // Background pill so the label is readable over busy copper
    const padding = fontSize * 0.4
    const t = svg.ownerDocument.createElementNS(NS, 'text')
    t.setAttribute('x', x)
    t.setAttribute('y', y)
    t.setAttribute('font-family', 'ui-monospace, SFMono-Regular, monospace')
    t.setAttribute('font-size', fontSize)
    t.setAttribute('fill', '#ffffff')
    t.setAttribute('text-anchor', 'middle')
    t.setAttribute('dominant-baseline', 'middle')
    t.setAttribute('paint-order', 'stroke')
    t.setAttribute('stroke', '#cf222e')
    t.setAttribute('stroke-width', padding)
    t.setAttribute('stroke-linejoin', 'round')
    t.textContent = text
    overlay.appendChild(t)
  }

  function distanceMm(p1, p2) {
    if (!unitsPerMm) return null
    const dxUnits = p2.x - p1.x
    const dyUnits = p2.y - p1.y
    const distUnits = Math.sqrt(dxUnits * dxUnits + dyUnits * dyUnits)
    return distUnits / unitsPerMm
  }

  function redraw() {
    clearOverlay()
    if (!firstPoint) return
    drawMarker(firstPoint.x, firstPoint.y)
    if (secondPoint) {
      drawMarker(secondPoint.x, secondPoint.y)
      drawLine(firstPoint.x, firstPoint.y, secondPoint.x, secondPoint.y)
      const mm = distanceMm(firstPoint, secondPoint)
      if (mm != null) {
        const midX = (firstPoint.x + secondPoint.x) / 2
        const midY = (firstPoint.y + secondPoint.y) / 2
        drawLabel(midX, midY, formatDistance(mm, unit))
      }
    }
  }

  function onPointerDown(e) {
    if (!active) return
    if (e.button !== 0) return
    e.stopPropagation()
    e.preventDefault()
    const p = clientToSvgPoint(svg, e.clientX, e.clientY)
    if (!p) return
    if (!firstPoint || (firstPoint && secondPoint)) {
      // Start a new measurement
      firstPoint = { x: p.x, y: p.y }
      secondPoint = null
      redraw()
      status('Click second point to measure (Esc to exit)')
    } else {
      // Complete the measurement
      secondPoint = { x: p.x, y: p.y }
      redraw()
      const mm = distanceMm(firstPoint, secondPoint)
      if (mm != null) {
        const text = formatDistance(mm, unit)
        status(`Distance: ${text} (click again to start new measurement)`)
        if (onDistance) onDistance({ mm, formatted: text })
      } else {
        status('Distance unavailable: SVG has no physical units')
      }
    }
  }

  function onPointerMove(e) {
    if (!active || !firstPoint || secondPoint) return
    const p = clientToSvgPoint(svg, e.clientX, e.clientY)
    if (!p) return
    // Live preview line from first point to cursor
    clearOverlay()
    drawMarker(firstPoint.x, firstPoint.y)
    drawLine(firstPoint.x, firstPoint.y, p.x, p.y, true)
    const mm = distanceMm(firstPoint, p)
    if (mm != null) {
      const midX = (firstPoint.x + p.x) / 2
      const midY = (firstPoint.y + p.y) / 2
      drawLabel(midX, midY, formatDistance(mm, unit))
    }
  }

  function onKeyDown(e) {
    if (!active) return
    if (e.key === 'Escape') {
      e.preventDefault()
      deactivate()
    }
  }

  function activate() {
    svg = stage.querySelector('svg')
    if (!svg) {
      status('No SVG to measure')
      return false
    }
    // Cache original width/height for calibration. setupZoomPan strips the
    // attributes off the SVG, so we capture them here on first activation
    // if not already cached.
    if (!svg.dataset.ghgvOriginalWidth && svg.getAttribute('width')) {
      svg.dataset.ghgvOriginalWidth = svg.getAttribute('width')
    }
    if (!svg.dataset.ghgvOriginalHeight && svg.getAttribute('height')) {
      svg.dataset.ghgvOriginalHeight = svg.getAttribute('height')
    }
    unitsPerMm = getCalibration(svg)
    if (!unitsPerMm) {
      status('Cannot measure: SVG has no physical-unit calibration')
      return false
    }
    if (active) return true
    active = true
    ensureOverlay()
    firstPoint = null
    secondPoint = null
    redraw()

    ac = new AbortController()
    const sig = ac.signal
    // Capture phase + stopPropagation so our handler fires before the
    // pan handler that setupZoomPan installed. The pan handler uses
    // `addEventListener('pointerdown', ...)` without capture, so capture
    // gets us first dibs.
    svg.addEventListener('pointerdown', onPointerDown, { capture: true, signal: sig })
    svg.addEventListener('pointermove', onPointerMove, { signal: sig })
    document.addEventListener('keydown', onKeyDown, { signal: sig })
    svg.style.cursor = 'crosshair'
    status('Click first point to measure (Esc to exit)')
    return true
  }

  function deactivate() {
    if (!active) return
    active = false
    if (ac) ac.abort()
    ac = null
    if (svg) svg.style.cursor = ''
    // Remove the overlay element entirely (not just its children). If we
    // leave the empty <g> behind, a subsequent rotation would sweep it
    // into the rotation group, and the next time the user activates
    // measure mode our markers would land inside the rotated frame.
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay)
    }
    overlay = null
    firstPoint = null
    secondPoint = null
    status('')
  }

  function setUnit(newUnit) {
    if (newUnit !== 'mm' && newUnit !== 'mil') return
    unit = newUnit
    if (active && firstPoint && secondPoint) redraw()
  }

  function isAvailable() {
    const s = stage.querySelector('svg')
    if (!s) return false
    if (!s.dataset.ghgvOriginalWidth && s.getAttribute('width')) {
      s.dataset.ghgvOriginalWidth = s.getAttribute('width')
    }
    if (!s.dataset.ghgvOriginalHeight && s.getAttribute('height')) {
      s.dataset.ghgvOriginalHeight = s.getAttribute('height')
    }
    return getCalibration(s) != null
  }

  return {
    activate,
    deactivate,
    isActive: () => active,
    setUnit,
    getUnit: () => unit,
    isAvailable,
  }
}
