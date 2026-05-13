// Parser for Gerber X2/X3 file attributes (the %TF.* commands).
//
// These are key=value metadata embedded in modern Gerber files that
// describe what the file represents without relying on filename
// conventions. The most useful ones for showing in a panel header:
//
//   %TF.FileFunction,Copper,L1,Top,Signal*%
//   %TF.Part,Single*%
//   %TF.GenerationSoftware,KiCad,Pcbnew,7.0.5*%
//   %TF.CreationDate,2025-01-15T10:30:00+02:00*%
//
// Older Gerber files (X1, or X2 without these attrs) won't have them.
// In that case we just return an empty metadata object and the panel
// keeps its existing whats-that-gerber-derived display.

// Match %TF.Name,arg1,arg2,...*% at start of a line. Robust to whitespace
// variations and stops at the trailing *%.
const TF_RE = /%TF\.([A-Za-z][A-Za-z0-9]*),([^*]*)\*%/g

export function parseX2Attributes(text) {
  if (!text) return {}
  // Only scan the file header (first ~8 KB). X2 attributes appear at the
  // top of the file by convention and parsing the entire body is wasteful
  // for large Gerbers.
  const head = text.slice(0, 8192)
  const attrs = {}
  let m
  TF_RE.lastIndex = 0
  while ((m = TF_RE.exec(head)) !== null) {
    const name = m[1]
    const args = m[2].split(',').map((s) => s.trim())
    attrs[name] = args
  }
  return attrs
}

// Build a short human-readable summary from parsed attrs. Returns null if
// nothing useful is present.
export function summarizeAttributes(attrs) {
  if (!attrs || Object.keys(attrs).length === 0) return null
  const parts = []

  if (attrs.FileFunction) {
    // FileFunction args vary by function:
    //   Copper,L1,Top,Signal
    //   Soldermask,Top
    //   Legend,Top  (silkscreen)
    //   Profile,NP
    //   Plated,1,4,PTH
    const [func, ...rest] = attrs.FileFunction
    if (func === 'Copper' && rest.length >= 2) {
      // L1,Top,Signal -> "Top copper (L1)"
      const layer = rest[0]   // e.g. "L1"
      const side = rest[1]    // "Top" or "Bot"
      const sideLabel = side === 'Bot' ? 'Bottom' : side === 'Top' ? 'Top' : side
      parts.push(`${sideLabel} copper (${layer})`)
    } else if (func === 'Soldermask' && rest[0]) {
      parts.push(`${rest[0] === 'Bot' ? 'Bottom' : rest[0]} soldermask`)
    } else if (func === 'Legend' && rest[0]) {
      parts.push(`${rest[0] === 'Bot' ? 'Bottom' : rest[0]} silkscreen`)
    } else if (func === 'Paste' && rest[0]) {
      parts.push(`${rest[0] === 'Bot' ? 'Bottom' : rest[0]} paste`)
    } else if (func === 'Profile') {
      parts.push('Board outline')
    } else if (func === 'Plated' || func === 'NonPlated') {
      // Plated,1,4,PTH -> "Drill (plated)"
      const plating = func === 'Plated' ? 'plated' : 'non-plated'
      parts.push(`Drill (${plating})`)
    } else {
      parts.push(func)
    }
  }

  if (attrs.GenerationSoftware) {
    // KiCad,Pcbnew,7.0.5 -> "KiCad 7.0.5"
    const [vendor, tool, version] = attrs.GenerationSoftware
    const label = version ? `${vendor} ${version}` : (tool ? `${vendor} (${tool})` : vendor)
    if (label) parts.push(label)
  }

  if (attrs.Part) {
    if (attrs.Part[0] === 'Array') parts.push('Panelized')
  }

  return parts.length > 0 ? parts.join(' \u2022 ') : null
}
