// Shared Gerber/Excellon detection helpers.
import whatsThatGerber from 'whats-that-gerber'

export const GERBER_EXTENSIONS = [
  // Common Gerber layer extensions
  'gbr', 'gbl', 'gtl', 'gbs', 'gts', 'gbo', 'gto', 'gbp', 'gtp',
  'gko', 'gm1', 'gm2', 'gm3', 'gml', 'gpb', 'gpt',
  // Eagle / CadSoft
  'cmp', 'sol', 'plc', 'pls', 'stc', 'sts',
  // Altium
  'gd1', 'gg1', 'gp1', 'gp2', 'gp3', 'gp4',
  // Excellon drill
  'drl', 'drd', 'xln', 'txt', 'tap', 'nc',
]

const GERBER_HEADER_PATTERNS = [
  /^G04 /m,
  /^%FS[LT][AI]/m,
  /^%MO(IN|MM)/m,
  /^%AD/m,
  /^M48/m, // Excellon header
]

export function looksLikeGerberByName(filename) {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (!ext) return false
  if (GERBER_EXTENSIONS.includes(ext)) return true
  const id = whatsThatGerber([filename])[filename]
  return Boolean(id && id.type)
}

export function looksLikeGerberByContent(text) {
  if (!text) return false
  const head = text.slice(0, 4096)
  return GERBER_HEADER_PATTERNS.some((rx) => rx.test(head))
}

// Distinguish drill from gerber by content. whats-that-gerber relies on
// filenames, which mis-classifies common drill extensions (notably .drd from
// Eagle) as outline layers. M48 in the header is the canonical Excellon
// marker; %FS and %MO are the canonical Gerber RS-274X markers.
export function sniffFiletype(text) {
  if (!text) return null
  const head = text.slice(0, 4096)
  if (/^M48/m.test(head)) return 'drill'
  if (/^%FS[LT][AI]/m.test(head) || /^%MO(IN|MM)/m.test(head)) return 'gerber'
  return null
}

// Some extensions (.txt, .tap, .nc) are ambiguous and need a content sniff
// before we trust them as Gerber/Excellon.
export function isAmbiguousExtension(filename) {
  const ext = filename.split('.').pop()?.toLowerCase()
  return ['txt', 'tap', 'nc'].includes(ext)
}

export function isZipFilename(filename) {
  return /\.zip$/i.test(filename)
}
