import * as p from '@clack/prompts'
import { parseRepo, listSkills, listMcpServers, fetchSkillFiles, fetchMcpDefinition } from '../lib/github.js'
import { detectAgents, GLOBAL_PATHS, GLOBAL_SKILL_AGENTS, AGENTS } from '../lib/agents.js'
import { installSkillGlobal, installSkillFiles, symlinkOrCopy } from '../lib/installer.js'
import { mergeMcpServer, buildServerConfig } from '../lib/mcp.js'
import { addSkillToLockfile, addMcpToLockfile } from '../lib/lockfile.js'
import { canonicalSkillsDir } from '../lib/agents.js'
import {
  pickItems,
  pickScope,
  pickAgents,
  pickGlobalAgents,
  confirmWrite,
  promptEnvVars,
} from '../ui/picker.js'

export async function add(repoArg, flags) {
  const { owner, repo, branch } = parseRepo(repoArg)
  const cwd = process.cwd()

  p.intro(`@levi-putna/agent-kit  ·  ${owner}/${repo}`)

  const spinner = p.spinner()
  spinner.start(`Fetching available skills and MCP servers from ${owner}/${repo}`)

  const [skills, mcpServers] = await Promise.all([
    listSkills(owner, repo, branch),
    listMcpServers(owner, repo, branch),
  ])

  spinner.stop(`Found ${skills.length} skill(s) and ${mcpServers.length} MCP server(s)`)

  if (skills.length === 0 && mcpServers.length === 0) {
    p.outro('No skills or MCP servers found in this repository.')
    return
  }

  // If specific skill/mcp passed as flags, skip the picker
  let selections = []
  if (flags.skill) {
    selections = [{ type: 'skill', name: flags.skill }]
  } else if (flags.mcp) {
    selections = [{ type: 'mcp', name: flags.mcp }]
  } else {
    selections = await pickItems({
      skills: flags.skill ? [flags.skill] : skills,
      mcpServers: flags.mcp ? [flags.mcp] : mcpServers,
    })
  }

  // Determine scope
  let scope = flags.global ? 'global' : flags.project ? 'project' : null
  const detectedAgents = detectAgents(cwd)

  if (!scope) {
    scope = await pickScope({ detectedAgents })
  }

  let agentKeys = []
  let globalAgentKeys = []

  if (scope === 'global') {
    globalAgentKeys = resolveGlobalAgentKeys({ agentFlag: flags.agent })
    if (globalAgentKeys.length === 0) {
      globalAgentKeys = await pickGlobalAgents({ globalSkillAgents: GLOBAL_SKILL_AGENTS })
    }
  } else if (scope === 'project' && detectedAgents.length > 0) {
    agentKeys = await pickAgents(detectedAgents)
  }

  // Install each selection
  for (const item of selections) {
    if (item.type === 'skill') {
      await installSkill({ owner, repo, branch, skillName: item.name, scope, agentKeys, globalAgentKeys, cwd })
    } else {
      await installMcp({ owner, repo, branch, serverName: item.name, scope, agentKeys, cwd })
    }
  }

  p.outro('Done!')
}

async function installSkill({ owner, repo, branch, skillName, scope, agentKeys, globalAgentKeys, cwd }) {
  const spinner = p.spinner()
  spinner.start(`Fetching ${skillName}`)
  const files = await fetchSkillFiles(owner, repo, skillName, branch)
  spinner.stop(`Fetched ${skillName} (${files.length} file(s))`)

  if (scope === 'global') {
    for (const key of globalAgentKeys) {
      const agent = GLOBAL_SKILL_AGENTS[key]
      if (!agent) continue
      const confirmed = await confirmWrite(agent.skillsDir, `write skill to ${agent.name}`)
      if (!confirmed) continue
      installSkillGlobal({ skillName, files, skillsDir: agent.skillsDir })
      p.log.success(`Installed ${skillName} → ${agent.displayPath}`)
    }
    return
  }

  // Project install: canonical copy + symlinks per agent
  const canonical = canonicalSkillsDir(cwd)
  const confirmed = await confirmWrite(canonical, 'write canonical skill to')
  if (!confirmed) return

  installSkillFiles(canonical, skillName, files)
  addSkillToLockfile(cwd, skillName, `${owner}/${repo}`, branch)

  for (const key of agentKeys) {
    const agent = AGENTS[key]
    if (!agent) continue
    const agentSkillsDir = agent.skillsDir(cwd)
    const result = symlinkOrCopy(
      `${canonical}/${skillName}`,
      agentSkillsDir,
      skillName,
      files,
    )
    p.log.success(`${agent.name}: ${result.mode === 'symlink' ? 'linked' : 'copied'} ${skillName}`)
  }
}

async function installMcp({ owner, repo, branch, serverName, scope, agentKeys, cwd }) {
  const spinner = p.spinner()
  spinner.start(`Fetching MCP definition for ${serverName}`)
  const definition = await fetchMcpDefinition(owner, repo, serverName, branch)
  spinner.stop(`Fetched ${serverName}`)

  // Prompt for env vars if the definition requires them
  let resolvedEnv = {}
  if (definition.env && Object.keys(definition.env).length > 0) {
    p.log.info(`${serverName} requires configuration:`)
    resolvedEnv = await promptEnvVars(definition.env)
  }

  const serverConfig = buildServerConfig(definition, resolvedEnv)

  const targets = getMcpTargets(scope, agentKeys, cwd)

  for (const target of targets) {
    const confirmed = await confirmWrite(target.path, `merge MCP server "${serverName}" into`)
    if (!confirmed) continue
    mergeMcpServer(target.path, serverName, serverConfig)
    p.log.success(`${target.label}: added ${serverName}`)
  }

  if (scope === 'project') {
    addMcpToLockfile(cwd, serverName, `${owner}/${repo}`, branch)
  }
}

function getMcpTargets(scope, agentKeys, cwd) {
  if (scope === 'global') {
    return [
      { path: GLOBAL_PATHS.claudeJson, label: 'Claude Code (global)' },
      { path: GLOBAL_PATHS.claudeDesktopConfig, label: 'Claude Desktop' },
    ]
  }

  const targets = [{ path: `${cwd}/.mcp.json`, label: 'Claude Code (project)' }]

  for (const key of agentKeys) {
    const agent = AGENTS[key]
    if (agent?.mcpFile) {
      targets.push({ path: agent.mcpFile(cwd), label: agent.name })
    }
  }

  return targets
}

// Resolve global agent keys from --agent flag, or empty to trigger picker
function resolveGlobalAgentKeys({ agentFlag }) {
  if (!agentFlag) return []
  if (!GLOBAL_SKILL_AGENTS[agentFlag]) {
    const valid = Object.keys(GLOBAL_SKILL_AGENTS).join(', ')
    throw new Error(`Unknown agent "${agentFlag}". Valid global agents: ${valid}`)
  }
  return [agentFlag]
}
