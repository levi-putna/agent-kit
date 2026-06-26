import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { detectAgents, listProjectAgents, canonicalSkillsDir, AGENTS, GLOBAL_PATHS, GLOBAL_SKILL_AGENTS } from './agents.js'

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

describe('listProjectAgents', () => {
  let tmp

  test('returns all agents with detected false when none present', () => {
    tmp = mkdirSync(join(tmpdir(), `agent-kit-test-${Date.now()}`), { recursive: true })
    const agents = listProjectAgents(tmp)
    assert.equal(agents.length, Object.keys(AGENTS).length)
    assert.ok(agents.every(a => a.detected === false))
    rmSync(tmp, { recursive: true, force: true })
  })

  test('marks detected agents correctly', () => {
    tmp = join(tmpdir(), `agent-kit-test-${Date.now()}`)
    mkdirSync(join(tmp, '.cursor'), { recursive: true })
    const agents = listProjectAgents(tmp)
    const cursor = agents.find(a => a.key === 'cursor')
    assert.ok(cursor)
    assert.equal(cursor.detected, true)
    assert.equal(agents.filter(a => a.detected).length, 1)
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

  test('cursorSkills path contains .cursor/skills', () => {
    assert.ok(GLOBAL_PATHS.cursorSkills.includes('.cursor'))
    assert.ok(GLOBAL_PATHS.cursorSkills.includes('skills'))
  })

  test('claudeDesktopConfig path is set', () => {
    assert.ok(typeof GLOBAL_PATHS.claudeDesktopConfig === 'string')
    assert.ok(GLOBAL_PATHS.claudeDesktopConfig.length > 0)
  })
})

describe('GLOBAL_SKILL_AGENTS', () => {
  test('includes claude and cursor with skillsDir and displayPath', () => {
    assert.ok(GLOBAL_SKILL_AGENTS.claude)
    assert.ok(GLOBAL_SKILL_AGENTS.cursor)
    assert.ok(GLOBAL_SKILL_AGENTS.claude.skillsDir.includes('.claude'))
    assert.ok(GLOBAL_SKILL_AGENTS.cursor.skillsDir.includes('.cursor'))
    assert.ok(GLOBAL_SKILL_AGENTS.claude.displayPath.includes('~/.claude'))
    assert.ok(GLOBAL_SKILL_AGENTS.cursor.displayPath.includes('~/.cursor'))
  })
})
