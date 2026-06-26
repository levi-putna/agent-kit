import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { dirname } from 'path'
import { GLOBAL_PATHS } from './agents.js'

// Read a JSON config file, returning empty object if it doesn't exist
export function readJsonConfig(filePath) {
  if (!existsSync(filePath)) return {}
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'))
  } catch {
    throw new Error(`Could not parse config file: ${filePath}`)
  }
}

// Merge an MCP server entry into a config file
// Never overwrites — only adds or updates the named server
export function mergeMcpServer(filePath, serverName, serverConfig) {
  const config = readJsonConfig(filePath)

  if (!config.mcpServers) config.mcpServers = {}

  const existing = config.mcpServers[serverName]
  if (existing) {
    // Merge — preserve existing env vars the user may have set
    config.mcpServers[serverName] = {
      ...existing,
      ...serverConfig,
      env: { ...existing.env, ...serverConfig.env },
    }
  } else {
    config.mcpServers[serverName] = serverConfig
  }

  writeJsonConfig(filePath, config)
}

// Remove an MCP server entry from a config file
export function removeMcpServer(filePath, serverName) {
  if (!existsSync(filePath)) return false
  const config = readJsonConfig(filePath)
  if (!config.mcpServers?.[serverName]) return false
  delete config.mcpServers[serverName]
  writeJsonConfig(filePath, config)
  return true
}

// List MCP servers currently in a config file
export function listMcpServersInConfig(filePath) {
  const config = readJsonConfig(filePath)
  return Object.keys(config.mcpServers || {})
}

// Build the server config object from an mcp.json definition + resolved env vars
export function buildServerConfig(definition, resolvedEnv) {
  const config = {
    command: definition.command,
    args: definition.args || [],
  }
  if (Object.keys(resolvedEnv).length > 0) {
    config.env = resolvedEnv
  }
  return config
}

function writeJsonConfig(filePath, data) {
  mkdirSync(dirname(filePath), { recursive: true })
  writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8')
}
