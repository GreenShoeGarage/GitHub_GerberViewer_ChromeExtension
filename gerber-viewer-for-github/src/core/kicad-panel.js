// Stripped-down panel for KiCanvas-rendered files. KiCanvas owns its own
// WebGL canvas and handles zoom/pan/layer selection internally, so the
// SVG-oriented toolbar buttons don't apply here. We keep:
//   - title and metadata
//   - status text (used for "Loading..." and metadata summary)
//   - Hide/Show
//   - Green Shoe Garage credit
// and add nothing else. KiCanvas's own UI lives inside the <kicanvas-embed>
// element it creates in the stage.

import { ensureStyles, renderError } from './panel.js'

export function makeKiCadPanel({ filename }) {
  ensureStyles()

  const panel = document.createElement('div')
  panel.className = 'ghgv-panel'
  panel.setAttribute('data-ghgv', '1')

  const toolbar = document.createElement('div')
  toolbar.className = 'ghgv-toolbar'

  const title = document.createElement('span')
  title.className = 'ghgv-title'
  title.textContent = `KiCad preview: ${filename}`

  const meta = document.createElement('span')
  meta.className = 'ghgv-meta'
  meta.textContent = 'kicad_pcb'

  const status = document.createElement('span')
  status.className = 'ghgv-status'

  const spacer = document.createElement('span')
  spacer.className = 'ghgv-spacer'

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

  toolbar.append(title, meta, status, spacer, toggleBtn, credit)

  const stage = document.createElement('div')
  stage.className = 'ghgv-stage ghgv-stage-kicad'
  stage.innerHTML = '<span class="ghgv-loading">Loading...</span>'

  panel.append(toolbar, stage)

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
    setStatus(msg) { status.textContent = msg },
    setError(msg) { renderError(stage, msg) },
    showLoading(msg) {
      stage.innerHTML = `<span class="ghgv-loading">${msg}</span>`
    },
  }
}
