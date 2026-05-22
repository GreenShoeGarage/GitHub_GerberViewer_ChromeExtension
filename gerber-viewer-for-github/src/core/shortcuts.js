// Keyboard shortcuts and help overlay.
//
// Shortcuts are scoped to the document but only fire when:
//   - the user is not typing in an input/textarea/contenteditable, and
//   - the panel is mounted and visible.
//
// The help overlay is a transparent fullscreen layer that lists every
// shortcut and a short explanation of the measurement tool. Pressing "?"
// toggles it. Pressing Escape closes it.
//
// The module exposes attachShortcuts(panel, controllers) where controllers
// is an object of callable hooks (fit, rotate, measure-toggle, etc.) so
// the module stays decoupled from the panel internals.

const SHORTCUTS = [
  { key: 'z', label: 'Z', desc: 'Fit view (reset zoom and pan)' },
  { key: 'r', label: 'R', desc: 'Rotate clockwise 90 degrees' },
  { key: 'R', label: 'Shift+R', desc: 'Rotate counter-clockwise 90 degrees' },
  { key: 'm', label: 'M', desc: 'Toggle measurement tool' },
  { key: 'u', label: 'U', desc: 'Toggle measurement unit (mm / mil)' },
  { key: 'l', label: 'L', desc: 'Switch to Layer view (blob pages only)' },
  { key: 't', label: 'T', desc: 'Switch to Top view' },
  { key: 'b', label: 'B', desc: 'Switch to Bottom view' },
  { key: 'o', label: 'O', desc: 'Toggle Outline mode' },
  { key: 'i', label: 'I', desc: 'Toggle Invert (dark mode)' },
  { key: 'h', label: 'H', desc: 'Hide / show the preview panel' },
  { key: '?', label: '?', desc: 'Show / hide this help overlay' },
  { key: 'Escape', label: 'Esc', desc: 'Close help overlay or exit measurement mode' },
]

// Predicate: is the user currently typing into an input-y element?
// We don't want to swallow keystrokes meant for GitHub's own UI.
function isTypingInInput() {
  const el = document.activeElement
  if (!el) return false
  const tag = el.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (el.isContentEditable) return true
  return false
}

function buildHelpOverlay() {
  const overlay = document.createElement('div')
  overlay.className = 'ghgv-help-overlay'
  overlay.setAttribute('role', 'dialog')
  overlay.setAttribute('aria-label', 'Keyboard shortcuts')

  const card = document.createElement('div')
  card.className = 'ghgv-help-card'

  const heading = document.createElement('h2')
  heading.className = 'ghgv-help-heading'
  heading.textContent = 'Keyboard shortcuts'
  card.appendChild(heading)

  const list = document.createElement('dl')
  list.className = 'ghgv-help-list'
  for (const s of SHORTCUTS) {
    const dt = document.createElement('dt')
    const kbd = document.createElement('kbd')
    kbd.textContent = s.label
    dt.appendChild(kbd)
    const dd = document.createElement('dd')
    dd.textContent = s.desc
    list.appendChild(dt)
    list.appendChild(dd)
  }
  card.appendChild(list)

  const tip = document.createElement('p')
  tip.className = 'ghgv-help-tip'
  tip.textContent =
    'Measurement tool: click a start point, then click an end point to ' +
    'measure the distance. The measurement locks when you finish. Click ' +
    'again to start a new measurement, or Shift-click to extend the ' +
    'current one into a multi-segment chain. Backspace undoes the last ' +
    'point, Escape exits. Zoom: pinch on a trackpad, or hold Cmd (Ctrl on ' +
    'Windows/Linux) and scroll. Plain scrolling moves the page.'
  card.appendChild(tip)

  const close = document.createElement('button')
  close.className = 'ghgv-help-close'
  close.textContent = 'Close'
  card.appendChild(close)

  overlay.appendChild(card)

  // Click outside the card closes it. Click on the close button closes it.
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target === close) {
      overlay.remove()
    }
  })

  return overlay
}

// Attach shortcuts to a panel. The `actions` object maps logical actions
// to callables; missing actions are ignored (so the kicad panel, which
// doesn't have rotate/measure, can pass only what it supports).
//
// Returns an AbortController so callers can detach the shortcuts
// (e.g., when the panel is destroyed).
export function attachShortcuts(panel, actions = {}) {
  const ac = new AbortController()

  let helpOverlay = null
  function toggleHelp() {
    if (helpOverlay) {
      helpOverlay.remove()
      helpOverlay = null
      return
    }
    helpOverlay = buildHelpOverlay()
    document.body.appendChild(helpOverlay)
  }
  function closeHelp() {
    if (helpOverlay) {
      helpOverlay.remove()
      helpOverlay = null
      return true
    }
    return false
  }

  function onKeyDown(e) {
    // Modifier-bearing combos (Ctrl/Cmd/Alt) are reserved for the browser
    // and operating system. We only act on bare key presses.
    if (e.ctrlKey || e.metaKey || e.altKey) return
    if (isTypingInInput()) return

    // Help overlay should be closeable with Escape even when the panel
    // isn't focused.
    if (e.key === 'Escape') {
      if (closeHelp()) {
        e.preventDefault()
        return
      }
      // Fall through to let other Esc handlers run (e.g. measurement exit)
    }

    if (e.key === '?') {
      e.preventDefault()
      toggleHelp()
      return
    }

    // The remaining shortcuts only fire when the panel is mounted and we
    // have an action for the key. We deliberately use a flat switch
    // rather than a map so the linter catches typos.
    const key = e.key
    let handled = false
    switch (key) {
      case 'z': case 'Z':
        if (actions.fit) { actions.fit(); handled = true }
        break
      case 'r':
        if (actions.rotateRight) { actions.rotateRight(); handled = true }
        break
      case 'R':
        if (actions.rotateLeft) { actions.rotateLeft(); handled = true }
        break
      case 'm': case 'M':
        if (actions.toggleMeasure) { actions.toggleMeasure(); handled = true }
        break
      case 'u': case 'U':
        if (actions.toggleUnit) { actions.toggleUnit(); handled = true }
        break
      case 'l': case 'L':
        if (actions.showLayer) { actions.showLayer(); handled = true }
        break
      case 't': case 'T':
        if (actions.showTop) { actions.showTop(); handled = true }
        break
      case 'b': case 'B':
        if (actions.showBottom) { actions.showBottom(); handled = true }
        break
      case 'o': case 'O':
        if (actions.toggleOutline) { actions.toggleOutline(); handled = true }
        break
      case 'i': case 'I':
        if (actions.toggleInvert) { actions.toggleInvert(); handled = true }
        break
      case 'h': case 'H':
        if (actions.toggleHide) { actions.toggleHide(); handled = true }
        break
    }
    if (handled) e.preventDefault()
  }

  document.addEventListener('keydown', onKeyDown, { signal: ac.signal })
  return ac
}
