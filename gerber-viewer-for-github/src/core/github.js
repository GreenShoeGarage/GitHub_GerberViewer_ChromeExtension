// GitHub URL parsing and HTTP helpers.

export function parseBlobUrl(pathname) {
  const m = pathname.match(/^\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/)
  if (!m) return null
  const [, owner, repo, ref, filepath] = m
  return {
    kind: 'blob',
    owner,
    repo,
    ref,
    filepath,
    filename: filepath.split('/').pop(),
    dir: filepath.includes('/') ? filepath.substring(0, filepath.lastIndexOf('/')) : '',
    rawUrl: `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${filepath}`,
  }
}

export function parseTreeUrl(pathname) {
  // Folder view: /{owner}/{repo}/tree/{ref}/{path}
  const m = pathname.match(/^\/([^/]+)\/([^/]+)\/tree\/([^/]+)\/(.+)$/)
  if (!m) {
    // Repo root: /{owner}/{repo} (with no /tree/ segment)
    const root = pathname.match(/^\/([^/]+)\/([^/]+)\/?$/)
    if (!root) return null
    const [, owner, repo] = root
    return { kind: 'tree', owner, repo, ref: null, dir: '' }
  }
  const [, owner, repo, ref, dir] = m
  return { kind: 'tree', owner, repo, ref, dir }
}

export function parseGistUrl(host, pathname) {
  // Gist URLs look like:
  //   gist.github.com/<user>/<gist-id>
  //   gist.github.com/<user>/<gist-id>/revisions
  //   gist.github.com/<user>/<gist-id>#file-board-gtl  (anchor handled separately)
  // The user segment is optional on anonymous gists, where the URL is
  //   gist.github.com/<gist-id>
  if (host !== 'gist.github.com') return null
  const segments = pathname.replace(/^\/|\/$/g, '').split('/')
  if (segments.length === 0) return null

  // Detect which segment is the gist-id (32-char hex). It is the last
  // segment whose name matches the pattern. Anonymous gists put it first,
  // named gists put it second.
  let gistId = null
  let user = null
  for (let i = segments.length - 1; i >= 0; i--) {
    if (/^[0-9a-f]{20,}$/i.test(segments[i])) {
      gistId = segments[i]
      if (i > 0) user = segments[i - 1]
      break
    }
  }
  if (!gistId) return null

  return { kind: 'gist', gistId, user }
}

export function parseGitHubUrl(pathname, host = 'github.com') {
  if (host === 'gist.github.com') {
    return parseGistUrl(host, pathname)
  }
  return parseBlobUrl(pathname) || parseTreeUrl(pathname)
}

// Fetch a Gist's metadata and file contents in one call. Returns the
// raw API response, which has the shape:
//   { id, owner: {...}, files: { 'name.gtl': { filename, content, raw_url, ... } }, ... }
export async function fetchGist(gistId) {
  const url = `https://api.github.com/gists/${gistId}`
  const res = await fetch(url, {
    credentials: 'omit',
    headers: { 'Accept': 'application/vnd.github.v3+json' },
  })
  if (!res.ok) {
    if (res.status === 403) {
      throw new Error('GitHub API rate-limited (60/hr unauthenticated)')
    }
    throw new Error(`Gist lookup failed: ${res.status}`)
  }
  return res.json()
}

export async function fetchRaw(rawUrl) {
  const res = await fetch(rawUrl, { credentials: 'omit' })
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
  return res.text()
}

export async function fetchRawBytes(rawUrl) {
  const res = await fetch(rawUrl, { credentials: 'omit' })
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
  return res.arrayBuffer()
}

export async function fetchDirListing({ owner, repo, ref, dir }) {
  // Build the path component carefully: empty dir = repo root listing.
  const path = dir ? `/${dir}` : ''
  const refQuery = ref ? `?ref=${encodeURIComponent(ref)}` : ''
  const url = `https://api.github.com/repos/${owner}/${repo}/contents${path}${refQuery}`
  const res = await fetch(url, {
    credentials: 'omit',
    headers: { 'Accept': 'application/vnd.github.v3+json' },
  })
  if (!res.ok) {
    if (res.status === 403) {
      throw new Error('GitHub API rate-limited (60/hr unauthenticated)')
    }
    throw new Error(`Directory listing failed: ${res.status}`)
  }
  return res.json()
}

// Resolve the default branch when a tree URL omits the ref (repo root).
export async function fetchDefaultBranch({ owner, repo }) {
  const url = `https://api.github.com/repos/${owner}/${repo}`
  const res = await fetch(url, {
    credentials: 'omit',
    headers: { 'Accept': 'application/vnd.github.v3+json' },
  })
  if (!res.ok) throw new Error(`Repo lookup failed: ${res.status}`)
  const data = await res.json()
  return data.default_branch
}
