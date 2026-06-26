import { readLockfile } from '../lib/lockfile.js'
import { GLOBAL_PATHS } from '../lib/agents.js'
import { readdirSync, existsSync } from 'fs'

export async function installed() {
  const cwd = process.cwd()

  // Project-scoped from lockfile
  const lock = readLockfile(cwd)

  const hasProjectSkills = Object.keys(lock.skills).length > 0
  const hasProjectMcp = Object.keys(lock.mcp).length > 0

  if (hasProjectSkills || hasProjectMcp) {
    console.log('\n  Project (agent-kit-lock.json):')
    if (hasProjectSkills) {
      console.log('    Skills:')
      for (const [name, info] of Object.entries(lock.skills)) {
        console.log(`      · ${name}  (${info.repo})`)
      }
    }
    if (hasProjectMcp) {
      console.log('    MCP:')
      for (const [name, info] of Object.entries(lock.mcp)) {
        console.log(`      · ${name}  (${info.repo})`)
      }
    }
  }

  // Global skills from ~/.claude/skills/
  const globalSkillsDir = GLOBAL_PATHS.claudeSkills
  if (existsSync(globalSkillsDir)) {
    const globalSkills = readdirSync(globalSkillsDir, { withFileTypes: true })
      .filter(d => d.isDirectory() || d.isSymbolicLink())
      .map(d => d.name)

    if (globalSkills.length > 0) {
      console.log('\n  Global (~/.claude/skills/):')
      for (const s of globalSkills) console.log(`    · ${s}`)
    }
  }

  if (!hasProjectSkills && !hasProjectMcp && !existsSync(GLOBAL_PATHS.claudeSkills)) {
    console.log('\n  Nothing installed yet. Run: agent-kit add <owner/repo>')
  }

  console.log()
}
