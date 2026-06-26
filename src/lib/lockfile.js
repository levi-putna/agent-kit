import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const LOCKFILE_NAME = 'agent-kit-lock.json'

export function getLockfilePath(cwd) {
  return join(cwd, LOCKFILE_NAME)
}

export function readLockfile(cwd) {
  const path = getLockfilePath(cwd)
  if (!existsSync(path)) return { skills: {}, mcp: {} }
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    return { skills: {}, mcp: {} }
  }
}

export function writeLockfile(cwd, data) {
  writeFileSync(getLockfilePath(cwd), JSON.stringify(data, null, 2) + '\n', 'utf8')
}

export function addSkillToLockfile(cwd, skillName, repo, branch) {
  const lock = readLockfile(cwd)
  lock.skills[skillName] = { repo, branch, installedAt: new Date().toISOString() }
  writeLockfile(cwd, lock)
}

export function addMcpToLockfile(cwd, serverName, repo, branch) {
  const lock = readLockfile(cwd)
  lock.mcp[serverName] = { repo, branch, installedAt: new Date().toISOString() }
  writeLockfile(cwd, lock)
}

export function removeFromLockfile(cwd, name, type) {
  const lock = readLockfile(cwd)
  if (type === 'skill') delete lock.skills[name]
  if (type === 'mcp') delete lock.mcp[name]
  writeLockfile(cwd, lock)
}
