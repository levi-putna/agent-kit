import * as p from '@clack/prompts'
import { removeSkill } from '../lib/installer.js'
import { removeMcpServer } from '../lib/mcp.js'
import { removeFromLockfile, readLockfile } from '../lib/lockfile.js'
import { GLOBAL_SKILL_AGENTS, AGENTS, canonicalSkillsDir } from '../lib/agents.js'
import { confirmWrite } from '../ui/picker.js'

export async function remove(name, flags) {
  if (!name) {
    p.log.error('Specify a skill or MCP server name to remove.')
    process.exit(1)
  }

  const cwd = process.cwd()
  const lock = readLockfile(cwd)

  const isSkill = name in lock.skills
  const isMcp = name in lock.mcp

  if (!isSkill && !isMcp) {
    // Try global skills across all supported global agents
    let removedAny = false
    for (const agent of Object.values(GLOBAL_SKILL_AGENTS)) {
      const removed = removeSkill(agent.skillsDir, name)
      if (removed) {
        p.log.success(`Removed global skill from ${agent.displayPath}: ${name}`)
        removedAny = true
      }
    }
    if (!removedAny) {
      p.log.error(`"${name}" not found in lockfile or global skills.`)
    }
    return
  }

  if (isSkill) {
    const confirmed = await confirmWrite(canonicalSkillsDir(cwd), `remove skill "${name}" from`)
    if (!confirmed) return

    removeSkill(canonicalSkillsDir(cwd), name)

    // Also remove symlinks from agent dirs
    for (const agent of Object.values(AGENTS)) {
      removeSkill(agent.skillsDir(cwd), name)
    }

    removeFromLockfile(cwd, name, 'skill')
    p.log.success(`Removed skill: ${name}`)
  }

  if (isMcp) {
    const targets = [
      { path: `${cwd}/.mcp.json`, label: 'Claude Code (project)' },
      ...Object.values(AGENTS)
        .filter(a => a.mcpFile)
        .map(a => ({ path: a.mcpFile(cwd), label: a.name })),
    ]

    for (const target of targets) {
      const removed = removeMcpServer(target.path, name)
      if (removed) p.log.success(`${target.label}: removed ${name}`)
    }

    removeFromLockfile(cwd, name, 'mcp')
  }
}
