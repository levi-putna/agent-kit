import { parseRepo, listSkills, listMcpServers, fetchRepoMeta } from '../lib/github.js'

export async function list(repoArg) {
  const { owner, repo, branch } = parseRepo(repoArg)

  const [meta, skills, mcpServers] = await Promise.all([
    fetchRepoMeta(owner, repo).catch(() => null),
    listSkills(owner, repo, branch),
    listMcpServers(owner, repo, branch),
  ])

  if (meta) {
    console.log(`\n  ${owner}/${repo}`)
    if (meta.description) console.log(`  ${meta.description}`)
    console.log()
  }

  if (skills.length > 0) {
    console.log('  Skills:')
    for (const s of skills) console.log(`    · ${s}`)
    console.log()
  }

  if (mcpServers.length > 0) {
    console.log('  MCP Servers:')
    for (const s of mcpServers) console.log(`    · ${s}`)
    console.log()
  }

  if (skills.length === 0 && mcpServers.length === 0) {
    console.log('  No skills or MCP servers found in this repository.')
  }
}
