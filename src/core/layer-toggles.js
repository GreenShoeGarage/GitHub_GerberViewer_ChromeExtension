// Layer visibility toggles for stackup views (Top and Bottom).
//
// pcb-stackup composes layers as nested <g> elements with classes like
// "<random>_cu" (copper), "_cf" (copper foil), "_sm" (soldermask), "_ss"
// (silkscreen), "_sp" (solderpaste), "_fr4" (substrate), "_out" (outline).
// The random prefix changes per build, so we match by class suffix.
//
// This module owns:
//   - the menu UI (a small popover anchored under a toolbar button)
//   - the visibility state per stage (a Map from suffix to boolean)
//   - applying that state to the currently-rendered SVG
//
// The state is reset when a new stackup is loaded (the SVG changes).

const LAYER_KINDS = [
  { suffix: '_ss', label: 'Silkscreen' },
  { suffix: '_sm', label: 'Soldermask' },
  { suffix: '_sp', label: 'Solderpaste' },
  { suffix: '_cu', label: 'Copper (plated)' },
  { suffix: '_cf', label: 'Copper (exposed)' },
  { suffix: '_fr4', label: 'Substrate' },
  { suffix: '_out', label: 'Board outline' },
]

export function makeLayerToggleController(stage) {
  // Visibility state. Default: all visible (no entry == visible).
  const visibility = new Map()
  LAYER_KINDS.forEach((k) => visibility.set(k.suffix, true))

  // Apply current visibility to the SVG currently in the stage. Safe to
  // call any time; if no SVG is present, this is a no-op.
  function applyVisibility() {
    const svg = stage.querySelector('svg')
    if (!svg) return
    for (const [suffix, visible] of visibility) {
      const elements = svg.querySelectorAll(`[class$="${suffix}"]`)
      for (const el of elements) {
        el.style.display = visible ? '' : 'none'
      }
    }
  }

  // Reset all to visible (used when a new stackup loads and we want a
  // clean slate). Doesn't re-render anything since the new SVG won't
  // have hidden state yet.
  function resetVisibility() {
    LAYER_KINDS.forEach((k) => visibility.set(k.suffix, true))
  }

  // Detect which layer kinds are actually present in the current SVG.
  // We only show toggles for kinds that exist; toggling a non-existent
  // layer would be confusing.
  function detectPresentKinds() {
    const svg = stage.querySelector('svg')
    if (!svg) return []
    return LAYER_KINDS.filter((k) => svg.querySelector(`[class$="${k.suffix}"]`))
  }

  return {
    applyVisibility,
    resetVisibility,
    detectPresentKinds,
    isVisible(suffix) { return visibility.get(suffix) !== false },
    setVisible(suffix, value) {
      visibility.set(suffix, !!value)
      applyVisibility()
    },
  }
}

// Build the toggle menu element. The menu is positioned absolutely by the
// caller (typically anchored under a toolbar button). Click outside or
// press Escape to dismiss; the panel handles dismissal in its own click
// handler.
export function buildLayerToggleMenu(controller, onChange) {
  const menu = document.createElement('div')
  menu.className = 'ghgv-layer-menu'

  const heading = document.createElement('div')
  heading.className = 'ghgv-layer-menu-heading'
  heading.textContent = 'Show layers'
  menu.appendChild(heading)

  const list = document.createElement('div')
  list.className = 'ghgv-layer-menu-list'
  menu.appendChild(list)

  const present = controller.detectPresentKinds()
  if (present.length === 0) {
    const empty = document.createElement('div')
    empty.className = 'ghgv-layer-menu-empty'
    empty.textContent = 'No toggleable layers detected.'
    list.appendChild(empty)
  } else {
    for (const kind of present) {
      const row = document.createElement('label')
      row.className = 'ghgv-layer-menu-row'
      const checkbox = document.createElement('input')
      checkbox.type = 'checkbox'
      checkbox.checked = controller.isVisible(kind.suffix)
      checkbox.addEventListener('change', () => {
        controller.setVisible(kind.suffix, checkbox.checked)
        if (onChange) onChange(kind.suffix, checkbox.checked)
      })
      const text = document.createElement('span')
      text.textContent = kind.label
      row.append(checkbox, text)
      list.appendChild(row)
    }

    // Convenience: "Show all" button at the bottom
    const showAll = document.createElement('button')
    showAll.className = 'ghgv-layer-menu-showall'
    showAll.textContent = 'Show all'
    showAll.addEventListener('click', () => {
      for (const kind of present) {
        controller.setVisible(kind.suffix, true)
      }
      // Re-check all checkboxes in the menu
      for (const cb of menu.querySelectorAll('input[type="checkbox"]')) {
        cb.checked = true
      }
      if (onChange) onChange(null, true)
    })
    menu.appendChild(showAll)
  }

  return menu
}
