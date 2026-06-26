import * as p from '@clack/prompts'
import { readLockfile } from '../lib/lockfile.js'
import { parseRepo, fetchSkillFiles, fetchMcpDefinition } from '../lib/github.js'
import { installSkillFiles } from '../lib/installer.js'
import { canonicalSkillsDir, GLOBAL_PATHS } from '../lib/agents.js'

export async function update(flags) {
  const cwd = process.cwd()
  const lock = readLockfile(cwd)

  const skillEntries = Object.entries(lock.skills)
  const mcpEntries = Object.entries(lock.mcp)

  if (skillEntries.length === 0 && mcpEntries.length === 0) {
    p.log.info('Nothing to update. No agent-kit-lock.json found or it is empty.')
    return
  }

  p.intro('agent-kit update')

  for (const [skillName, info] of skillEntries) {
    const { owner, repo } = parseRepo(info.repo)
    const spinner = p.spinner()
    spinner.start(`Updating ${skillName}`)
    try {
      const files = await fetchSkillFiles(owner, repo, skillName, info.branch)
      installSkillFiles(canonicalSkillsDir(cwd), skillName, files)
      spinner.stop(`Updated ${skillName}`)
    } catch (err) {
      spinner.stop(`Failed to update ${skillName}: ${err.message}`)
    }
  }

  p.outro('Update complete.')
}
