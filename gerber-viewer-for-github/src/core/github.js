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

export function parseGitHubUrl(pathname) {
  return parseBlobUrl(pathname) || parseTreeUrl(pathname)
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
