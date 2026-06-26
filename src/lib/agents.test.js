import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { detectAgents, canonicalSkillsDir, AGENTS, GLOBAL_PATHS } from './agents.js'

describe('detectAgents', () => {
  let tmp

  test('returns empty array when no agent directories exist', () => {
    tmp = mkdirSync(join(tmpdir(), `agent-kit-test-${Date.now()}`), { recursive: true })
    const found = detectAgents(tmp)
    assert.deepEqual(found, [])
    rmSync(tmp, { recursive: true, force: true })
  })

  test('detects claude when .claude directory exists', () => {
    tmp = join(tmpdir(), `agent-kit-test-${Date.now()}`)
    mkdirSync(join(tmp, '.claude'), { recursive: true })
    const found = detectAgents(tmp)
    assert.ok(found.some(a => a.key === 'claude'), 'should detect claude')
    rmSync(tmp, { recursive: true, force: true })
  })

  test('detects cursor when .cursor directory exists', () => {
    tmp = join(tmpdir(), `agent-kit-test-${Date.now()}`)
    mkdirSync(join(tmp, '.cursor'), { recursive: true })
    const found = detectAgents(tmp)
    assert.ok(found.some(a => a.key === 'cursor'), 'should detect cursor')
    rmSync(tmp, { recursive: true, force: true })
  })

  test('detects multiple agents', () => {
    tmp = join(tmpdir(), `agent-kit-test-${Date.now()}`)
    mkdirSync(join(tmp, '.claude'), { recursive: true })
    mkdirSync(join(tmp, '.cursor'), { recursive: true })
    mkdirSync(join(tmp, '.windsurf'), { recursive: true })
    const found = detectAgents(tmp)
    assert.equal(found.length, 3)
    rmSync(tmp, { recursive: true, force: true })
  })
})

describe('canonicalSkillsDir', () => {
  test('returns .agents/skills path inside cwd', () => {
    const result = canonicalSkillsDir('/some/project')
    assert.equal(result, '/some/project/.agents/skills')
  })
})

describe('AGENTS', () => {
  test('each agent has name, detect, skillsDir', () => {
    for (const [key, agent] of Object.entries(AGENTS)) {
      assert.ok(agent.name, `${key} should have a name`)
      assert.equal(typeof agent.detect, 'function', `${key}.detect should be a function`)
      assert.equal(typeof agent.skillsDir, 'function', `${key}.skillsDir should be a function`)
    }
  })

  test('skillsDir returns a path containing the agent key convention', () => {
    assert.ok(AGENTS.claude.skillsDir('/p').includes('.claude'))
    assert.ok(AGENTS.cursor.skillsDir('/p').includes('.cursor'))
    assert.ok(AGENTS.windsurf.skillsDir('/p').includes('.windsurf'))
  })
})

describe('GLOBAL_PATHS', () => {
  test('claudeSkills path contains .claude/skills', () => {
    assert.ok(GLOBAL_PATHS.claudeSkills.includes('.claude'))
    assert.ok(GLOBAL_PATHS.claudeSkills.includes('skills'))
  })

  test('claudeDesktopConfig path is set', () => {
    assert.ok(typeof GLOBAL_PATHS.claudeDesktopConfig === 'string')
    assert.ok(GLOBAL_PATHS.claudeDesktopConfig.length > 0)
  })
})
