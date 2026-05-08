// Smoke test: load the bundled content script in jsdom and verify both
// the single-layer fast path and the multi-layer top/bottom flow.

import fs from 'node:fs'
import path from 'node:path'
import jsdomPkg from 'jsdom'
const { JSDOM } = jsdomPkg

const FIXTURE_DIR = path.join('test', 'fixtures', 'arduino-uno')
const bundle = fs.readFileSync(path.join('dist', 'content.js'), 'utf8')

// Build an in-memory map of "rawUrl -> content" for the Arduino Uno fixtures
const fixtureFiles = fs.readdirSync(FIXTURE_DIR)
const RAW_BASE = 'https://raw.githubusercontent.com/example/repo/main/boards/'
const rawContent = new Map()
for (const f of fixtureFiles) {
  const text = fs.readFileSync(path.join(FIXTURE_DIR, f), 'utf8')
  rawContent.set(RAW_BASE + f, text)
}

// Build the synthetic Contents API response for /boards/
const dirListing = fixtureFiles.map((name) => ({
  name,
  type: 'file',
  size: fs.statSync(path.join(FIXTURE_DIR, name)).size,
  download_url: RAW_BASE + name,
}))

const html = `<!doctype html><html><head><title>test</title></head>
<body>
  <main>
    <div class="repository-content">
      <div class="Box mt-3">
        <pre>raw text would be here</pre>
      </div>
    </div>
  </main>
</body></html>`

const dom = new JSDOM(html, {
  url: 'https://github.com/example/repo/blob/main/boards/arduino-uno.cmp',
  runScripts: 'outside-only',
  pretendToBeVisual: true,
})

dom.window.fetch = (url) => {
  if (rawContent.has(url)) {
    return Promise.resolve({
      ok: true,
      status: 200,
      text: () => Promise.resolve(rawContent.get(url)),
    })
  }
  if (url.startsWith('https://api.github.com/repos/example/repo/contents/boards')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(dirListing),
    })
  }
  return Promise.reject(new Error('unexpected fetch ' + url))
}

dom.window.eval(bundle)

// Wait long enough for the multi-layer flow to complete. The Arduino Uno
// fixtures are non-trivial: parsing 6 Gerbers + 1 drill takes a few seconds.
await new Promise((r) => setTimeout(r, 15000))

const panel = dom.window.document.querySelector('[data-ghgv="1"]')
if (!panel) {
  console.error('FAIL: no preview panel mounted')
  console.error(dom.window.document.body.innerHTML.slice(0, 800))
  process.exit(1)
}

const stage = panel.querySelector('.ghgv-stage')
const layerSvg = stage?.querySelector('svg')
if (!layerSvg) {
  console.error('FAIL: single-layer SVG missing')
  console.error(stage?.innerHTML?.slice(0, 800))
  process.exit(1)
}
console.log('PASS single-layer: SVG length =', layerSvg.outerHTML.length)

// Check that Top and Bottom buttons enabled (means stackup completed)
const buttons = Array.from(panel.querySelectorAll('button'))
const topBtn = buttons.find((b) => b.dataset.view === 'top')
const bottomBtn = buttons.find((b) => b.dataset.view === 'bottom')
if (!topBtn || !bottomBtn) {
  console.error('FAIL: top/bottom buttons not present')
  process.exit(1)
}

const status = panel.querySelector('.ghgv-status')?.textContent
console.log('Status text after wait:', JSON.stringify(status))

if (topBtn.disabled || bottomBtn.disabled) {
  console.error('FAIL: top/bottom buttons still disabled after wait')
  console.error('status:', status)
  process.exit(1)
}

// Click the Top button and confirm the stage updates
topBtn.click()
await new Promise((r) => setTimeout(r, 100))
const topSvg = stage.querySelector('svg')
if (!topSvg || topSvg.outerHTML === layerSvg.outerHTML) {
  console.error('FAIL: clicking Top did not change stage SVG')
  process.exit(1)
}
console.log('PASS top view: SVG length =', topSvg.outerHTML.length)

bottomBtn.click()
await new Promise((r) => setTimeout(r, 100))
const bottomSvg = stage.querySelector('svg')
if (!bottomSvg || bottomSvg.outerHTML === topSvg.outerHTML) {
  console.error('FAIL: clicking Bottom did not change stage SVG')
  process.exit(1)
}
console.log('PASS bottom view: SVG length =', bottomSvg.outerHTML.length)

// --- Zoom tests ---
// Switch back to single layer for zoom tests since it has the simplest viewBox
const layerBtn = buttons.find((b) => b.dataset.view === 'layer')
layerBtn.click()
await new Promise((r) => setTimeout(r, 100))

const zoomInBtn = buttons.find((b) => b.title === 'Zoom in')
const zoomOutBtn = buttons.find((b) => b.title === 'Zoom out')
const fitBtn = buttons.find((b) => b.title === 'Reset zoom and pan')

if (!zoomInBtn || !zoomOutBtn || !fitBtn) {
  console.error('FAIL: zoom controls missing')
  process.exit(1)
}

const svgEl = stage.querySelector('svg')
const initialVb = svgEl.getAttribute('viewBox')
if (!initialVb) {
  console.error('FAIL: SVG has no viewBox after zoom setup')
  process.exit(1)
}
const [, , initialW] = initialVb.split(/\s+/).map(Number)

// Click zoom in - viewBox width should decrease
zoomInBtn.click()
const afterZoomInVb = svgEl.getAttribute('viewBox')
const [, , afterZoomInW] = afterZoomInVb.split(/\s+/).map(Number)
if (!(afterZoomInW < initialW)) {
  console.error('FAIL: viewBox width did not decrease on zoom in', { initialW, afterZoomInW })
  process.exit(1)
}
console.log('PASS zoom in: viewBox width', initialW, '->', afterZoomInW)

// Click zoom out twice - viewBox width should now exceed initial
zoomOutBtn.click()
zoomOutBtn.click()
const afterZoomOutVb = svgEl.getAttribute('viewBox')
const [, , afterZoomOutW] = afterZoomOutVb.split(/\s+/).map(Number)
if (!(afterZoomOutW > initialW)) {
  console.error('FAIL: viewBox width did not exceed initial after zoom out', { initialW, afterZoomOutW })
  process.exit(1)
}
console.log('PASS zoom out: viewBox width', afterZoomInW, '->', afterZoomOutW)

// Click Fit - viewBox should match initial
fitBtn.click()
const afterFitVb = svgEl.getAttribute('viewBox')
if (afterFitVb !== initialVb) {
  console.error('FAIL: Fit did not restore initial viewBox', { initialVb, afterFitVb })
  process.exit(1)
}
console.log('PASS fit: viewBox restored to', afterFitVb)

console.log('All checks passed for arduino-uno fixtures.')

// =============================================================================
// Second pass: SurreyEARS PCB-Workshop fixtures, which have a messy outline.
// Verify that the Outline toggle is enabled (both variants present) and that
// toggling it produces different SVG output for the top view.
// =============================================================================

const PCBW_DIR = path.join('test', 'fixtures', 'pcb-workshop')
const pcbwFiles = fs.readdirSync(PCBW_DIR)
const PCBW_BASE = 'https://raw.githubusercontent.com/example/pcbw/master/'
const pcbwContent = new Map()
for (const f of pcbwFiles) {
  pcbwContent.set(PCBW_BASE + f, fs.readFileSync(path.join(PCBW_DIR, f), 'utf8'))
}
const pcbwListing = pcbwFiles.map((name) => ({
  name,
  type: 'file',
  size: fs.statSync(path.join(PCBW_DIR, name)).size,
  download_url: PCBW_BASE + name,
}))

const dom2 = new JSDOM(html, {
  url: 'https://github.com/example/pcbw/blob/master/main.GTL',
  runScripts: 'outside-only',
  pretendToBeVisual: true,
})
dom2.window.fetch = (url) => {
  if (pcbwContent.has(url)) {
    return Promise.resolve({
      ok: true, status: 200,
      text: () => Promise.resolve(pcbwContent.get(url)),
    })
  }
  if (url.startsWith('https://api.github.com/repos/example/pcbw/contents/')) {
    return Promise.resolve({
      ok: true, status: 200,
      json: () => Promise.resolve(pcbwListing),
    })
  }
  return Promise.reject(new Error('unexpected fetch ' + url))
}
dom2.window.eval(bundle)
await new Promise((r) => setTimeout(r, 15000))

const panel2 = dom2.window.document.querySelector('[data-ghgv="1"]')
if (!panel2) {
  console.error('FAIL pcbw: no panel mounted')
  process.exit(1)
}
const buttons2 = Array.from(panel2.querySelectorAll('button'))
const outlineBtn = buttons2.find((b) => b.textContent === 'Outline')
const topBtn2 = buttons2.find((b) => b.dataset.view === 'top')

if (!outlineBtn) {
  console.error('FAIL pcbw: Outline button missing')
  process.exit(1)
}
if (outlineBtn.disabled) {
  console.error('FAIL pcbw: Outline button still disabled (both variants should be available)')
  console.error('status:', panel2.querySelector('.ghgv-status')?.textContent)
  process.exit(1)
}
console.log('PASS pcbw: Outline button enabled,', panel2.querySelector('.ghgv-status')?.textContent)

// Switch to Top view, capture the with-outline render
topBtn2.click()
await new Promise((r) => setTimeout(r, 100))
const stage2 = panel2.querySelector('.ghgv-stage')
const topWith = stage2.querySelector('svg').outerHTML

// Toggle outline off, capture the no-outline render
outlineBtn.click()
await new Promise((r) => setTimeout(r, 100))
const topWithout = stage2.querySelector('svg').outerHTML

if (topWith === topWithout) {
  console.error('FAIL pcbw: toggling Outline did not change the SVG')
  process.exit(1)
}
console.log('PASS pcbw: outline-on length =', topWith.length, ', outline-off length =', topWithout.length)

// --- Rotation tests ---
const rotateLeftBtn = buttons2.find((b) => b.title?.includes('counter-clockwise'))
const rotateRightBtn = buttons2.find((b) => b.title?.includes('clockwise') && !b.title.includes('counter'))
if (!rotateLeftBtn || !rotateRightBtn) {
  console.error('FAIL: rotate buttons missing', { left: !!rotateLeftBtn, right: !!rotateRightBtn })
  process.exit(1)
}

// Switch back to Top, capture original viewBox
topBtn2.click()
await new Promise((r) => setTimeout(r, 100))
const beforeRotateSvg = stage2.querySelector('svg')
const originalVb = beforeRotateSvg.getAttribute('viewBox')

// Rotate right 90 degrees: viewBox should swap dimensions
rotateRightBtn.click()
await new Promise((r) => setTimeout(r, 100))
const afterRotateSvg = stage2.querySelector('svg')
const rotatedVb = afterRotateSvg.getAttribute('viewBox')
const [, , origW, origH] = originalVb.split(/\s+/).map(Number)
const [, , rotW, rotH] = rotatedVb.split(/\s+/).map(Number)
if (Math.abs(rotW - origH) > 0.01 || Math.abs(rotH - origW) > 0.01) {
  console.error('FAIL: viewBox dimensions did not swap on 90 deg rotation')
  console.error('  original:', originalVb, '-> rotated:', rotatedVb)
  process.exit(1)
}
// Verify the rotation group exists and has a rotate transform
const rotGroup = afterRotateSvg.querySelector('g[data-ghgv-rot]')
if (!rotGroup || !rotGroup.getAttribute('transform')?.startsWith('rotate(90')) {
  console.error('FAIL: rotation group missing or wrong transform')
  console.error('  rotGroup:', !!rotGroup, 'transform:', rotGroup?.getAttribute('transform'))
  process.exit(1)
}
console.log('PASS rotate right: viewBox', origW + 'x' + origH, '->', rotW + 'x' + rotH)

// Rotate right three more times to wrap back to 0
rotateRightBtn.click()
rotateRightBtn.click()
rotateRightBtn.click()
await new Promise((r) => setTimeout(r, 100))
const wrappedSvg = stage2.querySelector('svg')
const wrappedVb = wrappedSvg.getAttribute('viewBox')
if (wrappedVb !== originalVb) {
  console.error('FAIL: viewBox did not return to original after 4x90 rotations')
  console.error('  original:', originalVb, ', after 4 rotations:', wrappedVb)
  process.exit(1)
}
console.log('PASS rotate full circle: viewBox restored')

// Rotate left should be inverse of rotate right
rotateLeftBtn.click()
await new Promise((r) => setTimeout(r, 100))
const afterLeftSvg = stage2.querySelector('svg')
const leftVb = afterLeftSvg.getAttribute('viewBox')
// Left from 0 = 270 degrees, which also swaps dimensions
const [, , leftW, leftH] = leftVb.split(/\s+/).map(Number)
if (Math.abs(leftW - origH) > 0.01 || Math.abs(leftH - origW) > 0.01) {
  console.error('FAIL: viewBox did not swap on rotate-left')
  process.exit(1)
}
const leftGroup = afterLeftSvg.querySelector('g[data-ghgv-rot]')
if (!leftGroup?.getAttribute('transform')?.startsWith('rotate(270')) {
  console.error('FAIL: rotate-left did not produce 270deg transform')
  process.exit(1)
}
console.log('PASS rotate left: 270deg transform applied')

// Verify Green Shoe Garage link is present
const credit = panel2.querySelector('.ghgv-credit a')
if (!credit) {
  console.error('FAIL: GSG credit link missing')
  process.exit(1)
}
if (credit.textContent !== 'Green Shoe Garage') {
  console.error('FAIL: GSG link text wrong:', credit.textContent)
  process.exit(1)
}
if (credit.getAttribute('href') !== 'https://greenshoegarage.com') {
  console.error('FAIL: GSG link href wrong:', credit.getAttribute('href'))
  process.exit(1)
}
console.log('PASS Green Shoe Garage link present')

console.log('All checks passed.')
