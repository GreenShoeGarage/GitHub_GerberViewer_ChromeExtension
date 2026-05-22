// Soldermask color presets.
//
// pcb-stackup composites a board from layer "films," each tinted by a color
// map keyed by layer-type suffix:
//   fr4 = substrate, cu = buried copper, cf = exposed copper (finish),
//   sm  = soldermask (the translucent colored coat that gives a board its
//         characteristic color), ss = silkscreen, sp = solderpaste,
//   out = board outline.
//
// To a user, "board color" means the soldermask color. Each preset below
// overrides `sm` (and `ss` where contrast requires it). Anything a preset
// leaves undefined falls back to the pcb-stackup default, so we only carry
// the values that actually change.
//
// IMPORTANT: pcb-stackup expects each color as a single CSS color STRING,
// not an object. Opacity is encoded in the string. We use 8-digit hex
// (#rrggbbaa) where the final byte is alpha. Soldermask is translucent so
// copper and substrate show through (that sheen is what makes traces
// readable under the mask); the stock green is #004200bf (alpha 0xbf =
// ~0.75). Glossy finishes stay near that; near-opaque finishes (black,
// white) use a higher alpha.

// The stock pcb-stackup defaults, captured for reference. We never mutate
// this; presets spread over it.
export const DEFAULT_COLORS = {
  fr4: '#666666',
  cu: '#cccccc',
  cf: '#cc9933',
  sm: '#004200bf',
  ss: '#ffffff',
  sp: '#999999',
  out: '#000000',
}

// Preset definitions. `id` is the stable key stored in settings; `label`
// is shown in the UI; `swatch` is the solid color used to draw the little
// menu dot (a representative opaque version of the mask color). `colors`
// is the partial override merged onto DEFAULT_COLORS.
//
// Alpha byte reference: bf=0.75, c8=0.78, cc=0.80, d1=0.82, db=0.86.
export const COLOR_PRESETS = [
  {
    id: 'green',
    label: 'Green',
    swatch: '#0a7a2f',
    colors: { sm: '#004200bf', ss: '#ffffff' },
  },
  {
    id: 'red',
    label: 'Red',
    swatch: '#b71c1c',
    colors: { sm: '#7a0000bf', ss: '#ffffff' },
  },
  {
    id: 'blue',
    label: 'Blue',
    swatch: '#1565c0',
    colors: { sm: '#00204ac8', ss: '#ffffff' },
  },
  {
    id: 'black',
    label: 'Black',
    swatch: '#1a1a1a',
    // Black mask is nearly opaque; silkscreen flips to white for contrast.
    colors: { sm: '#0a0a0adb', ss: '#f0f0f0' },
  },
  {
    id: 'white',
    label: 'White',
    swatch: '#e8e8e8',
    // White mask needs black silkscreen, otherwise the legend vanishes.
    colors: { sm: '#e6e6e6d1', ss: '#1a1a1a' },
  },
  {
    id: 'yellow',
    label: 'Yellow',
    swatch: '#f9a825',
    // Yellow is light enough that black silkscreen reads better.
    colors: { sm: '#caa400c8', ss: '#1a1a1a' },
  },
  {
    id: 'purple',
    label: 'Purple',
    swatch: '#6a1b9a',
    // The OSH Park signature.
    colors: { sm: '#2a0a4acc', ss: '#ffffff' },
  },
]

export const DEFAULT_PRESET_ID = 'green'

// Resolve a preset id to a full color map ready for pcb-stackup. Unknown
// ids fall back to the default green. The returned object merges the
// preset's partial override on top of the stock defaults so every layer
// type has a value.
export function colorsForPreset(presetId) {
  const preset = COLOR_PRESETS.find((p) => p.id === presetId) || COLOR_PRESETS[0]
  return {
    ...DEFAULT_COLORS,
    ...preset.colors,
  }
}

export function isValidPresetId(presetId) {
  return COLOR_PRESETS.some((p) => p.id === presetId)
}
