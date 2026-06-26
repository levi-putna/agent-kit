import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { parseRepo } from './github.js'

describe('parseRepo', () => {
  test('parses owner/repo format', () => {
    const result = parseRepo('levi-putna/my-skills')
    assert.equal(result.owner, 'levi-putna')
    assert.equal(result.repo, 'my-skills')
    assert.equal(result.branch, 'main')
  })

  test('parses owner/repo@branch format', () => {
    const result = parseRepo('levi-putna/my-skills@develop')
    assert.equal(result.owner, 'levi-putna')
    assert.equal(result.repo, 'my-skills')
    assert.equal(result.branch, 'develop')
  })

  test('throws on missing repo argument', () => {
    assert.throws(() => parseRepo(undefined), /No repository specified/)
  })

  test('throws on invalid format (no slash)', () => {
    assert.throws(() => parseRepo('not-valid'), /Invalid repo format/)
  })

  test('throws on too many slashes', () => {
    assert.throws(() => parseRepo('a/b/c'), /Invalid repo format/)
  })
})
