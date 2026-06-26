import { test, describe, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import {
  readLockfile,
  writeLockfile,
  addSkillToLockfile,
  addMcpToLockfile,
  removeFromLockfile,
  getLockfilePath,
} from './lockfile.js'

describe('lockfile', () => {
  let tmp

  beforeEach(() => {
    tmp = join(tmpdir(), `agent-kit-lock-test-${Date.now()}`)
    mkdirSync(tmp, { recursive: true })
  })

  afterEach(() => {
    rmSync(tmp, { recursive: true, force: true })
  })

  test('readLockfile returns empty structure when no file exists', () => {
    const lock = readLockfile(tmp)
    assert.deepEqual(lock, { skills: {}, mcp: {} })
  })

  test('writeLockfile and readLockfile round-trips data', () => {
    const data = { skills: { 'my-skill': { repo: 'a/b', branch: 'main' } }, mcp: {} }
    writeLockfile(tmp, data)
    const read = readLockfile(tmp)
    assert.deepEqual(read.skills['my-skill'].repo, 'a/b')
  })

  test('addSkillToLockfile adds a skill entry', () => {
    addSkillToLockfile(tmp, 'code-review', 'levi-putna/skills', 'main')
    const lock = readLockfile(tmp)
    assert.ok('code-review' in lock.skills)
    assert.equal(lock.skills['code-review'].repo, 'levi-putna/skills')
    assert.equal(lock.skills['code-review'].branch, 'main')
    assert.ok(lock.skills['code-review'].installedAt)
  })

  test('addMcpToLockfile adds an mcp entry', () => {
    addMcpToLockfile(tmp, 'postgres', 'levi-putna/mcp-servers', 'main')
    const lock = readLockfile(tmp)
    assert.ok('postgres' in lock.mcp)
    assert.equal(lock.mcp['postgres'].repo, 'levi-putna/mcp-servers')
  })

  test('removeFromLockfile removes a skill entry', () => {
    addSkillToLockfile(tmp, 'code-review', 'levi-putna/skills', 'main')
    removeFromLockfile(tmp, 'code-review', 'skill')
    const lock = readLockfile(tmp)
    assert.ok(!('code-review' in lock.skills))
  })

  test('removeFromLockfile removes an mcp entry', () => {
    addMcpToLockfile(tmp, 'postgres', 'levi-putna/mcp-servers', 'main')
    removeFromLockfile(tmp, 'postgres', 'mcp')
    const lock = readLockfile(tmp)
    assert.ok(!('postgres' in lock.mcp))
  })

  test('getLockfilePath returns path in the given directory', () => {
    const p = getLockfilePath('/some/project')
    assert.ok(p.startsWith('/some/project'))
    assert.ok(p.endsWith('.json'))
  })
})
