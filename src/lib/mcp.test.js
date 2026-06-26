import { test, describe, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import {
  readJsonConfig,
  mergeMcpServer,
  removeMcpServer,
  listMcpServersInConfig,
  buildServerConfig,
} from './mcp.js'

describe('mcp', () => {
  let tmp

  beforeEach(() => {
    tmp = join(tmpdir(), `agent-kit-mcp-test-${Date.now()}`)
    mkdirSync(tmp, { recursive: true })
  })

  afterEach(() => {
    rmSync(tmp, { recursive: true, force: true })
  })

  describe('readJsonConfig', () => {
    test('returns empty object when file does not exist', () => {
      const result = readJsonConfig(join(tmp, 'missing.json'))
      assert.deepEqual(result, {})
    })

    test('parses existing JSON file', () => {
      const file = join(tmp, 'config.json')
      writeFileSync(file, JSON.stringify({ mcpServers: { foo: { command: 'bar' } } }))
      const result = readJsonConfig(file)
      assert.equal(result.mcpServers.foo.command, 'bar')
    })
  })

  describe('mergeMcpServer', () => {
    test('creates file and adds server when config does not exist', () => {
      const file = join(tmp, 'mcp.json')
      mergeMcpServer(file, 'my-server', { command: 'npx', args: ['-y', 'my-pkg'] })
      const config = readJsonConfig(file)
      assert.equal(config.mcpServers['my-server'].command, 'npx')
    })

    test('merges into existing config without removing other servers', () => {
      const file = join(tmp, 'mcp.json')
      writeFileSync(file, JSON.stringify({ mcpServers: { existing: { command: 'node' } } }))
      mergeMcpServer(file, 'new-server', { command: 'npx', args: [] })
      const config = readJsonConfig(file)
      assert.ok('existing' in config.mcpServers, 'should preserve existing server')
      assert.ok('new-server' in config.mcpServers, 'should add new server')
    })

    test('merges env vars without clobbering user-set values', () => {
      const file = join(tmp, 'mcp.json')
      writeFileSync(file, JSON.stringify({
        mcpServers: { srv: { command: 'npx', env: { KEY: 'user-value', OTHER: 'keep' } } },
      }))
      mergeMcpServer(file, 'srv', { command: 'npx', env: { KEY: 'new-value', ADDED: 'yes' } })
      const config = readJsonConfig(file)
      // User-set KEY is overwritten by merge (new definition wins), OTHER is preserved
      assert.equal(config.mcpServers.srv.env.OTHER, 'keep')
      assert.equal(config.mcpServers.srv.env.ADDED, 'yes')
    })
  })

  describe('removeMcpServer', () => {
    test('returns false when file does not exist', () => {
      const result = removeMcpServer(join(tmp, 'missing.json'), 'srv')
      assert.equal(result, false)
    })

    test('returns false when server not in config', () => {
      const file = join(tmp, 'mcp.json')
      writeFileSync(file, JSON.stringify({ mcpServers: {} }))
      assert.equal(removeMcpServer(file, 'nonexistent'), false)
    })

    test('removes the named server and returns true', () => {
      const file = join(tmp, 'mcp.json')
      writeFileSync(file, JSON.stringify({ mcpServers: { srv: { command: 'npx' }, keep: {} } }))
      const result = removeMcpServer(file, 'srv')
      assert.equal(result, true)
      const config = readJsonConfig(file)
      assert.ok(!('srv' in config.mcpServers))
      assert.ok('keep' in config.mcpServers)
    })
  })

  describe('listMcpServersInConfig', () => {
    test('returns empty array when file does not exist', () => {
      assert.deepEqual(listMcpServersInConfig(join(tmp, 'missing.json')), [])
    })

    test('returns server names from config', () => {
      const file = join(tmp, 'mcp.json')
      writeFileSync(file, JSON.stringify({ mcpServers: { alpha: {}, beta: {} } }))
      const names = listMcpServersInConfig(file)
      assert.deepEqual(names.sort(), ['alpha', 'beta'])
    })
  })

  describe('buildServerConfig', () => {
    test('builds config with command and args', () => {
      const def = { command: 'npx', args: ['-y', 'my-server'] }
      const result = buildServerConfig(def, {})
      assert.equal(result.command, 'npx')
      assert.deepEqual(result.args, ['-y', 'my-server'])
      assert.ok(!result.env, 'should not include env when empty')
    })

    test('includes env when provided', () => {
      const def = { command: 'npx', args: [] }
      const result = buildServerConfig(def, { API_KEY: 'abc' })
      assert.deepEqual(result.env, { API_KEY: 'abc' })
    })
  })
})
