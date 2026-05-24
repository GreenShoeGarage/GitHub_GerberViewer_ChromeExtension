// Generates a corpus of edge-case Gerber fixtures that exercise the messy
// real-world conditions clean fixtures don't: KiCad-style naming, a board
// with no outline file, a single-sided board, uppercase extensions, and a
// truncated/malformed file that must fail gracefully.
//
// Run from the repo root:  node test/fixtures/generate-corpus.mjs
//
// The generated boards are intentionally tiny (a square pad or two) so the
// fixtures stay small; the point is to exercise filename detection, layer
// pairing, outline handling, and error paths, not to be visually rich.

import { mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))

// A minimal valid RS-274X Gerber: metric, one rectangular pad flashed at a
// couple of positions. `tag` lets us vary the geometry slightly per layer
// so composited renders are not degenerate.
function gerber(tag = 0) {
  const x = 1000 + tag * 200
  return [
    'G04 synthetic fixture*',
    '%MOMM*%',
    '%FSLAX34Y34*%',
    '%LPD*%',
    '%ADD10R,1.00000X1.00000*%',
    '%ADD11C,0.50000*%',
    'D10*',
    `X${x}Y1000D03*`,
    `X${x + 3000}Y1000D03*`,
    'D11*',
    `X${x}Y4000D03*`,
    'M02*',
    '',
  ].join('\n')
}

// A board outline: a closed rectangle drawn with a thin aperture.
function outline() {
  return [
    'G04 synthetic outline*',
    '%MOMM*%',
    '%FSLAX34Y34*%',
    '%ADD10C,0.10000*%',
    'D10*',
    'X0Y0D02*',
    'X60000Y0D01*',
    'X60000Y50000D01*',
    'X0Y50000D01*',
    'X0Y0D01*',
    'M02*',
    '',
  ].join('\n')
}

// A Gerber X2 file declaring its layer function via file attributes, so the
// X2 attribute parser has something to read.
function gerberX2() {
  return [
    'G04 synthetic X2*',
    '%TF.FileFunction,Copper,L1,Top*%',
    '%TF.GenerationSoftware,SyntheticCAD,Generator,1.0*%',
    '%MOMM*%',
    '%FSLAX34Y34*%',
    '%LPD*%',
    '%ADD10R,1.00000X1.00000*%',
    'D10*',
    'X1000Y1000D03*',
    'M02*',
    '',
  ].join('\n')
}

function write(dir, name, content) {
  const full = join(here, 'corpus', dir)
  mkdirSync(full, { recursive: true })
  writeFileSync(join(full, name), content)
}

// 1. KiCad-style naming. KiCad exports like "<project>-F_Cu.gbr",
//    "<project>-B_Cu.gbr", "<project>-Edge_Cuts.gbr", etc. Our detector must
//    map these to top copper / bottom copper / outline.
write('kicad-naming', 'board-F_Cu.gbr', gerber(0))
write('kicad-naming', 'board-B_Cu.gbr', gerber(1))
write('kicad-naming', 'board-F_Mask.gbr', gerber(0))
write('kicad-naming', 'board-B_Mask.gbr', gerber(1))
write('kicad-naming', 'board-F_Silkscreen.gbr', gerber(0))
write('kicad-naming', 'board-Edge_Cuts.gbr', outline())
write('kicad-naming', 'board.drl', [
  'M48', 'METRIC,TZ', 'T1C0.40000', '%', 'G90', 'G05', 'T1',
  'X10.0Y10.0', 'X20.0Y10.0', 'M30', '',
].join('\n'))

// 2. No-outline board: top + bottom copper and masks, but no edge layer.
//    The stackup must compute a boundary from the features instead.
write('no-outline', 'top.gtl', gerber(0))
write('no-outline', 'bottom.gbl', gerber(1))
write('no-outline', 'topmask.gts', gerber(0))
write('no-outline', 'bottommask.gbs', gerber(1))

// 3. Single-sided board: only top copper, mask, silk, and an outline. Many
//    hobby boards are one-sided; the viewer should still composite a Top.
write('single-sided', 'top.gtl', gerber(0))
write('single-sided', 'topmask.gts', gerber(0))
write('single-sided', 'topsilk.gto', gerber(0))
write('single-sided', 'outline.gko', outline())

// 4. Uppercase extensions (Protel/Altium style), already covered by the
//    pcb-workshop fixture, but we add a tiny synthetic one for unit-level
//    detection tests that don't want to load the big fixture.
write('uppercase-ext', 'BOARD.GTL', gerber(0))
write('uppercase-ext', 'BOARD.GBL', gerber(1))
write('uppercase-ext', 'BOARD.GKO', outline())

// 5. X2 attributes.
write('x2-attributes', 'top.gtl', gerberX2())
write('x2-attributes', 'bottom.gbl', gerber(1))
write('x2-attributes', 'outline.gko', outline())

// 6. Malformed: a truncated Gerber that ends mid-command. The renderer must
//    fail gracefully (structured error), never throw uncaught.
write('malformed', 'broken.gtl', '%MOMM*%\n%FSLAX34Y34*%\n%ADD10R,1.0X1.0*%\nD10*\nX1000Y100')

console.log('Edge-case corpus generated under test/fixtures/corpus/')
