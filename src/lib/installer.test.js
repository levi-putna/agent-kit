import { test, describe, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { mkdirSync, rmSync, existsSync, readFileSync, lstatSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { installSkillFiles, symlinkOrCopy, removeSkill } from './installer.js'

describe('installer', () => {
  let tmp

  beforeEach(() => {
    tmp = join(tmpdir(), `agent-kit-installer-test-${Date.now()}`)
    mkdirSync(tmp, { recursive: true })
  })

  afterEach(() => {
    rmSync(tmp, { recursive: true, force: true })
  })

  const sampleFiles = [
    { name: 'SKILL.md', content: '---\nname: test\n---\nHello' },
    { name: 'helper.sh', content: '#!/bin/sh\necho hello' },
  ]

  describe('installSkillFiles', () => {
    test('creates skill directory and writes files', () => {
      installSkillFiles(tmp, 'my-skill', sampleFiles)
      assert.ok(existsSync(join(tmp, 'my-skill', 'SKILL.md')))
      assert.ok(existsSync(join(tmp, 'my-skill', 'helper.sh')))
    })

    test('writes correct file content', () => {
      installSkillFiles(tmp, 'my-skill', sampleFiles)
      const content = readFileSync(join(tmp, 'my-skill', 'SKILL.md'), 'utf8')
      assert.equal(content, '---\nname: test\n---\nHello')
    })

    test('creates nested target directory if it does not exist', () => {
      const nested = join(tmp, 'deep', 'nested', 'skills')
      installSkillFiles(nested, 'my-skill', sampleFiles)
      assert.ok(existsSync(join(nested, 'my-skill', 'SKILL.md')))
    })

    test('overwrites existing files on reinstall', () => {
      installSkillFiles(tmp, 'my-skill', sampleFiles)
      const updated = [{ name: 'SKILL.md', content: 'updated content' }]
      installSkillFiles(tmp, 'my-skill', updated)
      const content = readFileSync(join(tmp, 'my-skill', 'SKILL.md'), 'utf8')
      assert.equal(content, 'updated content')
    })
  })

  describe('symlinkOrCopy', () => {
    test('creates a symlink from agent dir to canonical dir', () => {
      const canonical = join(tmp, 'canonical', 'skills', 'my-skill')
      const agentSkillsDir = join(tmp, '.claude', 'skills')
      installSkillFiles(join(tmp, 'canonical', 'skills'), 'my-skill', sampleFiles)

      const result = symlinkOrCopy(canonical, agentSkillsDir, 'my-skill', sampleFiles)

      assert.ok(['symlink', 'copy'].includes(result.mode))
      assert.ok(existsSync(join(agentSkillsDir, 'my-skill')))
    })

    test('removes existing link/dir before re-linking', () => {
      const canonical = join(tmp, 'canonical', 'skills', 'my-skill')
      const agentSkillsDir = join(tmp, '.claude', 'skills')
      installSkillFiles(join(tmp, 'canonical', 'skills'), 'my-skill', sampleFiles)

      symlinkOrCopy(canonical, agentSkillsDir, 'my-skill', sampleFiles)
      // Call again — should not throw
      assert.doesNotThrow(() => {
        symlinkOrCopy(canonical, agentSkillsDir, 'my-skill', sampleFiles)
      })
    })
  })

  describe('removeSkill', () => {
    test('returns false when skill does not exist', () => {
      assert.equal(removeSkill(tmp, 'nonexistent'), false)
    })

    test('removes skill directory and returns true', () => {
      installSkillFiles(tmp, 'my-skill', sampleFiles)
      assert.ok(existsSync(join(tmp, 'my-skill')))

      const result = removeSkill(tmp, 'my-skill')
      assert.equal(result, true)
      assert.ok(!existsSync(join(tmp, 'my-skill')))
    })
  })
})
