// Rendering pipeline. Takes parsed file data and produces SVG strings.
// Used by all handlers (blob single-layer, blob multi-layer, tree, zip).

import gerberToSvg from 'gerber-to-svg'
import pcbStackup from 'pcb-stackup'
import whatsThatGerber from 'whats-that-gerber'
import { sniffFiletype } from './detect.js'

// Render a single Gerber/drill file as flat-blue SVG. This matches the
// v0.1+ behavior that's known to work correctly on real-world files.
export async function renderSingleLayer(gerberText, isDrill) {
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

// Build pcb-stackup layer inputs from raw file pairs. Applies the .drd
// content-sniff override so Excellon drill files get classified correctly
// regardless of what whats-that-gerber thinks of their filename.
export function makeLayerInputs(files) {
  return files.map(({ filename, content }) => {
    const layer = { filename, gerber: content }
    if (sniffFiletype(content) === 'drill') {
      layer.type = 'drill'
      layer.side = 'all'
    }
    return layer
  })
}

// Extract the inner-layer index from a filename. KiCad uses "In1_Cu.gbr",
// "In2_Cu.gbr"; Altium uses ".g1", ".g2", ".g3"; some EDA tools use ".in1",
// ".in2". Returns the integer (1-based) or null if no number is parseable.
function getInnerLayerNumber(filename) {
  // KiCad: In<N>_Cu (case-insensitive)
  let m = filename.match(/[._-]?In(\d+)[._-]?Cu/i)
  if (m) return parseInt(m[1], 10)
  // Altium: .g<N> (but not .gbr, .gko, etc.)
  m = filename.match(/\.g(\d+)$/i)
  if (m) return parseInt(m[1], 10)
  // Some tools: .in<N>
  m = filename.match(/\.in(\d+)$/i)
  if (m) return parseInt(m[1], 10)
  // Some tools: _l<N>_ where N is a layer number > 1 and < total
  return null
}

// Identify inner copper layers among a set of files and render each one
// individually with gerber-to-svg. Returns an array of {label, svg, filename}
// ordered by layer number (1, 2, 3, ...). Empty array if no inner layers
// found. Matches the Layer tab's flat-blue rendering semantics so users
// who switch from Layer to In1/In2/etc see consistent visual style.
export async function renderInnerLayers(files) {
  // Pair each file with its whats-that-gerber classification and inner-layer
  // number. We accept any file the classifier reports as copper+inner, and
  // sort by the parsed number so In1 comes before In2.
  const innerFiles = []
  for (const file of files) {
    const wtg = whatsThatGerber([file.filename])[file.filename]
    if (wtg?.type !== 'copper' || wtg?.side !== 'inner') continue
    const num = getInnerLayerNumber(file.filename)
    innerFiles.push({ ...file, innerNum: num })
  }
  if (innerFiles.length === 0) return []

  // Sort: files with a parseable number go first in numeric order, then any
  // remaining unnumbered inner layers by filename. In practice every real
  // EDA tool numbers them, so the fallback rarely triggers.
  innerFiles.sort((a, b) => {
    if (a.innerNum != null && b.innerNum != null) return a.innerNum - b.innerNum
    if (a.innerNum != null) return -1
    if (b.innerNum != null) return 1
    return a.filename.localeCompare(b.filename)
  })

  const results = []
  for (let i = 0; i < innerFiles.length; i++) {
    const file = innerFiles[i]
    try {
      const svg = await renderSingleLayer(file.content, false)
      const label = file.innerNum != null ? `In${file.innerNum}` : `In${i + 1}`
      results.push({ label, svg, filename: file.filename })
    } catch (e) {
      console.warn('[gerber-gh] inner layer render failed for', file.filename, e)
    }
  }
  return results
}

// Build top/bottom composite renders. Returns null if fewer than 2 layers.
// When an outline file is present, also builds a no-outline variant so the
// caller can offer a toggle for boards with malformed outline geometry.
export async function buildStackup(files) {
  if (files.length < 2) {
    return { stackup: null, reason: 'fewer than 2 layers' }
  }

  const layers = makeLayerInputs(files)
  const stackup = await pcbStackup(layers)

  let stackupNoOutline = null
  const layersWithoutOutline = layers.filter((l) => {
    if (l.type === 'outline') return false
    const wtg = whatsThatGerber([l.filename])[l.filename]
    return wtg?.type !== 'outline'
  })
  const hasOutline = layersWithoutOutline.length < layers.length
  if (hasOutline && layersWithoutOutline.length >= 2) {
    try {
      stackupNoOutline = await pcbStackup(layersWithoutOutline)
    } catch (e) {
      console.warn('[gerber-gh] no-outline stackup failed', e)
    }
  }

  // Render inner layers individually so handlers can offer In1/In2/... tabs.
  // We don't gate this on hasInner since renderInnerLayers itself returns
  // [] when there are none.
  const innerLayers = await renderInnerLayers(files)

  return {
    stackup,
    stackupNoOutline,
    hasOutline,
    layerCount: layers.length,
    innerLayers,
  }
}

// Convenience: extract just the SVG strings from a stackup result for
// passing to the panel.
export function stackupSvgs(stackup) {
  if (!stackup) return null
  return { top: stackup.top.svg, bottom: stackup.bottom.svg }
}
