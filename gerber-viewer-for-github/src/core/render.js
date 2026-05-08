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

  return {
    stackup,
    stackupNoOutline,
    hasOutline,
    layerCount: layers.length,
  }
}

// Convenience: extract just the SVG strings from a stackup result for
// passing to the panel.
export function stackupSvgs(stackup) {
  if (!stackup) return null
  return { top: stackup.top.svg, bottom: stackup.bottom.svg }
}
