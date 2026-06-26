#!/usr/bin/env node

import { add } from '../src/commands/add.js'
import { list } from '../src/commands/list.js'
import { installed } from '../src/commands/installed.js'
import { remove } from '../src/commands/remove.js'
import { update } from '../src/commands/update.js'

const args = process.argv.slice(2)
const command = args[0]

function parseFlags(args) {
  const flags = {
    global: args.includes('--global') || args.includes('-g'),
    project: args.includes('--project') || args.includes('-p'),
    skill: flagValue(args, '--skill'),
    mcp: flagValue(args, '--mcp'),
  }
  const positional = args.filter(a => !a.startsWith('-'))
  return { flags, positional }
}

function flagValue(args, flag) {
  const i = args.indexOf(flag)
  return i !== -1 ? args[i + 1] : undefined
}

function printHelp() {
  console.log(`
  @levi-putna/agent-kit — AI agent configuration manager

  Usage:
    agent-kit add <owner/repo> [options]   Install skills and/or MCP servers
    agent-kit list <owner/repo>            Browse what's available in a repo
    agent-kit installed                    Show locally installed skills/MCP
    agent-kit update                       Update installed skills to latest
    agent-kit remove <name>                Remove a skill or MCP entry

  Options for add:
    --skill <name>    Install a specific skill
    --mcp <name>      Install a specific MCP server
    --global, -g      Install to global Claude paths (~/.claude/skills/)
    --project, -p     Install to project (detects present agents)

  Examples:
    agent-kit add levi-putna/my-skills
    agent-kit add levi-putna/my-skills --skill code-review
    agent-kit add levi-putna/my-skills --mcp postgres --global
    agent-kit list levi-putna/my-skills
`)
}

async function main() {
  if (!command || command === '--help' || command === '-h') {
    printHelp()
    process.exit(0)
  }

  const { flags, positional } = parseFlags(args.slice(1))

  try {
    switch (command) {
      case 'add':
        await add(positional[0], flags)
        break
      case 'list':
        await list(positional[0])
        break
      case 'installed':
        await installed()
        break
      case 'remove':
        await remove(positional[0], flags)
        break
      case 'update':
        await update(flags)
        break
      default:
        console.error(`Unknown command: ${command}`)
        printHelp()
        process.exit(1)
    }
  } catch (err) {
    console.error(`\nError: ${err.message}`)
    process.exit(1)
  }
}

main()
