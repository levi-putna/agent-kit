import * as p from '@clack/prompts'

// Ask user to pick skills and/or MCP servers from what's available
export async function pickItems({ skills, mcpServers }) {
  p.intro('@levi-putna/agent-kit')

  const choices = []

  if (skills.length > 0) {
    const picked = await p.multiselect({
      message: 'Select skills to install:',
      options: skills.map(s => ({ value: s, label: s })),
      required: false,
    })
    if (p.isCancel(picked)) { p.cancel('Cancelled'); process.exit(0) }
    choices.push(...picked.map(s => ({ type: 'skill', name: s })))
  }

  if (mcpServers.length > 0) {
    const picked = await p.multiselect({
      message: 'Select MCP servers to install:',
      options: mcpServers.map(s => ({ value: s, label: s })),
      required: false,
    })
    if (p.isCancel(picked)) { p.cancel('Cancelled'); process.exit(0) }
    choices.push(...picked.map(s => ({ type: 'mcp', name: s })))
  }

  if (choices.length === 0) {
    p.cancel('Nothing selected.')
    process.exit(0)
  }

  return choices
}

// Ask user to choose install scope (global or project)
export async function pickScope({ detectedAgents }) {
  const options = [
    {
      value: 'global',
      label: 'Global — available in all projects (~/.claude/skills/, ~/.cursor/skills/)',
    },
  ]

  if (detectedAgents.length > 0) {
    const agentNames = detectedAgents.map(a => a.name).join(', ')
    options.push({ value: 'project', label: `Project — install for detected agents (${agentNames})` })
  }

  const scope = await p.select({
    message: 'Install scope:',
    options,
  })

  if (p.isCancel(scope)) { p.cancel('Cancelled'); process.exit(0) }
  return scope
}

// Ask user to pick which agents receive a global skill install
export async function pickGlobalAgents({ globalSkillAgents }) {
  const picked = await p.multiselect({
    message: 'Install globally for which agents?',
    options: Object.entries(globalSkillAgents).map(([key, agent]) => ({
      value: key,
      label: `${agent.name} (${agent.displayPath})`,
    })),
    initialValues: Object.keys(globalSkillAgents),
  })
  if (p.isCancel(picked)) { p.cancel('Cancelled'); process.exit(0) }
  if (picked.length === 0) {
    p.cancel('No agents selected.')
    process.exit(0)
  }
  return picked
}

// Ask user to pick which detected agents to install skills for
export async function pickAgents(detectedAgents) {
  const picked = await p.multiselect({
    message: 'Install skills for which agents?',
    options: detectedAgents.map(a => ({ value: a.key, label: a.name })),
    initialValues: detectedAgents.map(a => a.key),
  })
  if (p.isCancel(picked)) { p.cancel('Cancelled'); process.exit(0) }
  return picked
}

// Ask user to confirm before writing to a config file
export async function confirmWrite(filePath, action = 'write') {
  const confirmed = await p.confirm({
    message: `Permission to ${action}: ${filePath}`,
    initialValue: true,
  })
  if (p.isCancel(confirmed)) { p.cancel('Cancelled'); process.exit(0) }
  return confirmed
}

// Prompt user for required env var values for an MCP server
export async function promptEnvVars(envDefinitions) {
  const resolved = {}
  for (const [key, def] of Object.entries(envDefinitions)) {
    const description = typeof def === 'object' ? def.description : ''
    const required = typeof def === 'object' ? def.required : false

    const value = await p.text({
      message: `${key}${description ? ` — ${description}` : ''}`,
      placeholder: required ? '(required)' : '(optional, press enter to skip)',
      validate: required ? (v) => v.trim() ? undefined : 'This value is required' : undefined,
    })

    if (p.isCancel(value)) { p.cancel('Cancelled'); process.exit(0) }
    if (value.trim()) resolved[key] = value.trim()
  }
  return resolved
}

export { p }
