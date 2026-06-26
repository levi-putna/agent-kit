import { join } from 'path'
import { homedir } from 'os'
import { existsSync } from 'fs'

// All supported agents and their config conventions
export const AGENTS = {
  claude: {
    name: 'Claude Code',
    detect: (cwd) => existsSync(join(cwd, '.claude')),
    skillsDir: (cwd) => join(cwd, '.claude', 'skills'),
    mcpFile: (cwd) => join(cwd, '.mcp.json'),
  },
  cursor: {
    name: 'Cursor',
    detect: (cwd) => existsSync(join(cwd, '.cursor')),
    skillsDir: (cwd) => join(cwd, '.cursor', 'skills'),
    mcpFile: (cwd) => join(cwd, '.cursor', 'mcp.json'),
  },
  windsurf: {
    name: 'Windsurf',
    detect: (cwd) => existsSync(join(cwd, '.windsurf')),
    skillsDir: (cwd) => join(cwd, '.windsurf', 'skills'),
    mcpFile: (cwd) => join(cwd, '.windsurf', 'mcp.json'),
  },
  copilot: {
    name: 'GitHub Copilot',
    detect: (cwd) => existsSync(join(cwd, '.github')),
    skillsDir: (cwd) => join(cwd, '.github', 'skills'),
    mcpFile: (cwd) => join(cwd, '.vscode', 'mcp.json'),
  },
  cline: {
    name: 'Cline',
    detect: (cwd) => existsSync(join(cwd, '.cline')),
    skillsDir: (cwd) => join(cwd, '.cline', 'skills'),
    mcpFile: null,
  },
  opencode: {
    name: 'OpenCode',
    detect: () => existsSync(join(homedir(), '.config', 'opencode')),
    skillsDir: (cwd) => join(cwd, '.opencode', 'skills'),
    mcpFile: null,
  },
}

// Agents that support global (user-level) skill installs
export const GLOBAL_SKILL_AGENTS = {
  claude: {
    name: 'Claude Code',
    skillsDir: join(homedir(), '.claude', 'skills'),
    displayPath: '~/.claude/skills/',
  },
  cursor: {
    name: 'Cursor',
    skillsDir: join(homedir(), '.cursor', 'skills'),
    displayPath: '~/.cursor/skills/',
  },
}

// Global paths (not project-scoped)
export const GLOBAL_PATHS = {
  claudeSkills: GLOBAL_SKILL_AGENTS.claude.skillsDir,
  cursorSkills: GLOBAL_SKILL_AGENTS.cursor.skillsDir,
  claudeJson: join(homedir(), '.claude.json'),
  claudeDesktopConfig: getDesktopConfigPath(),
}

// Canonical project skills location — all agent dirs symlink here
export function canonicalSkillsDir(cwd) {
  return join(cwd, '.agents', 'skills')
}

// Detect which agents are present in the given directory
export function detectAgents(cwd) {
  return Object.entries(AGENTS)
    .filter(([, agent]) => agent.detect(cwd))
    .map(([key, agent]) => ({ key, ...agent }))
}

/**
 * All agents available for project-scoped installs, with detection status.
 */
export function listProjectAgents(cwd) {
  return Object.entries(AGENTS).map(([key, agent]) => ({
    key,
    name: agent.name,
    detected: agent.detect(cwd),
  }))
}

function getDesktopConfigPath() {
  switch (process.platform) {
    case 'darwin':
      return join(homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json')
    case 'win32':
      return join(process.env.APPDATA || '', 'Claude', 'claude_desktop_config.json')
    default:
      return join(homedir(), '.config', 'Claude', 'claude_desktop_config.json')
  }
}
