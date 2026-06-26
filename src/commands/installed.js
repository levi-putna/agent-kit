import { readLockfile } from '../lib/lockfile.js'
import { GLOBAL_SKILL_AGENTS } from '../lib/agents.js'
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

  // Global skills from each supported agent
  let hasGlobalSkills = false
  for (const agent of Object.values(GLOBAL_SKILL_AGENTS)) {
    if (!existsSync(agent.skillsDir)) continue

    const globalSkills = readdirSync(agent.skillsDir, { withFileTypes: true })
      .filter(d => d.isDirectory() || d.isSymbolicLink())
      .map(d => d.name)

    if (globalSkills.length === 0) continue

    hasGlobalSkills = true
    console.log(`\n  Global (${agent.displayPath}):`)
    for (const s of globalSkills) console.log(`    · ${s}`)
  }

  if (!hasProjectSkills && !hasProjectMcp && !hasGlobalSkills) {
    console.log('\n  Nothing installed yet. Run: npx @levi-putna/agent-kit@latest add <owner/repo>')
  }

  console.log()
}
