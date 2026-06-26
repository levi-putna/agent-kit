const GITHUB_API = 'https://api.github.com'
const GITHUB_RAW = 'https://raw.githubusercontent.com'

// Parse "owner/repo" into parts, with optional branch (owner/repo@branch)
export function parseRepo(repoArg) {
  if (!repoArg) throw new Error('No repository specified. Usage: agent-kit add owner/repo')
  const [repoPath, branch = 'main'] = repoArg.split('@')
  const parts = repoPath.split('/')
  if (parts.length !== 2) throw new Error(`Invalid repo format: "${repoArg}". Expected owner/repo`)
  return { owner: parts[0], repo: parts[1], branch }
}

// List available skills in a repo (looks for skills/ directory)
export async function listSkills(owner, repo, branch = 'main') {
  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/skills?ref=${branch}`
  const res = await ghFetch(url)
  if (res.status === 404) return []
  const items = await res.json()
  return items
    .filter(i => i.type === 'dir')
    .map(i => i.name)
}

// List available MCP servers in a repo (looks for mcp/ directory)
export async function listMcpServers(owner, repo, branch = 'main') {
  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/mcp?ref=${branch}`
  const res = await ghFetch(url)
  if (res.status === 404) return []
  const items = await res.json()
  return items
    .filter(i => i.type === 'dir')
    .map(i => i.name)
}

// Fetch the SKILL.md content for a given skill
export async function fetchSkillContent(owner, repo, skillName, branch = 'main') {
  const url = `${GITHUB_RAW}/${owner}/${repo}/${branch}/skills/${skillName}/SKILL.md`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Could not fetch skill "${skillName}" from ${owner}/${repo}`)
  return res.text()
}

// Fetch all files in a skill directory (SKILL.md + any supporting files)
export async function fetchSkillFiles(owner, repo, skillName, branch = 'main') {
  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/skills/${skillName}?ref=${branch}`
  const res = await ghFetch(url)
  if (!res.ok) throw new Error(`Skill "${skillName}" not found in ${owner}/${repo}`)
  const items = await res.json()
  const files = []
  for (const item of items) {
    if (item.type === 'file') {
      const content = await fetch(item.download_url).then(r => r.text())
      files.push({ name: item.name, content })
    }
  }
  return files
}

// Fetch the mcp.json definition for a given MCP server
export async function fetchMcpDefinition(owner, repo, serverName, branch = 'main') {
  const url = `${GITHUB_RAW}/${owner}/${repo}/${branch}/mcp/${serverName}/mcp.json`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Could not fetch MCP definition "${serverName}" from ${owner}/${repo}`)
  return res.json()
}

// Fetch repo metadata (description, stars etc) for display
export async function fetchRepoMeta(owner, repo) {
  const res = await ghFetch(`${GITHUB_API}/repos/${owner}/${repo}`)
  if (!res.ok) throw new Error(`Repository "${owner}/${repo}" not found or not accessible`)
  return res.json()
}

async function ghFetch(url) {
  const headers = { 'User-Agent': '@levi-putna/agent-kit' }
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`
  }
  return fetch(url, { headers })
}
