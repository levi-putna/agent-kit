# @levi-putna/agent-kit

A configuration manager for AI coding agents. Install skills and MCP servers from any GitHub repo into Claude, Cursor, Windsurf, and other agents — globally or per project.

[![GitHub](https://img.shields.io/github/stars/levi-putna/agent-kit?style=social)](https://github.com/levi-putna/agent-kit)
[![npm version](https://img.shields.io/npm/v/@levi-putna/agent-kit)](https://www.npmjs.com/package/@levi-putna/agent-kit)
[![npm downloads](https://img.shields.io/npm/dm/@levi-putna/agent-kit)](https://www.npmjs.com/package/@levi-putna/agent-kit)
[![Node.js 18+](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)

---

## Install

```sh
npm install -g @levi-putna/agent-kit
```

Or run without installing:

```sh
npx @levi-putna/agent-kit add owner/repo
```

---

## Usage

### Browse what's available in a repo

```sh
agent-kit list levi-putna/my-skills
```

### Install interactively

```sh
agent-kit add levi-putna/my-skills
```

Detects which agents are present in your project (.claude, .cursor, .windsurf, etc.) and walks you through selecting skills and MCP servers to install.

### Install a specific skill or MCP server

```sh
agent-kit add levi-putna/my-skills --skill code-review
agent-kit add levi-putna/my-skills --mcp postgres
```

### Install globally (available across all projects)

```sh
agent-kit add levi-putna/my-skills --global
```

Prompts you to choose global agents (Claude Code and/or Cursor). Skills are installed to:

- `~/.claude/skills/` — Claude Code and Claude desktop app
- `~/.cursor/skills/` — Cursor (all projects)

Install to Cursor only:

```sh
agent-kit add levi-putna/my-skills --skill code-review --global --agent cursor
```

### Install to your project

```sh
agent-kit add levi-putna/my-skills --project
```

Skills are written to `.agents/skills/` with symlinks from each detected agent directory. An `agent-kit-lock.json` is created so teammates can reproduce the same setup.

### Manage installed skills

```sh
agent-kit installed          # list what's installed
agent-kit update             # pull latest versions from source repos
agent-kit remove code-review # remove a skill or MCP server
```

---

## Supported agents

| Agent | Skills | MCP config |
|---|---|---|
| Claude Code | ✅ `~/.claude/skills/` (global) · `.claude/skills/` (project) | ✅ `~/.claude.json` · `.mcp.json` |
| Claude Desktop | ✅ via global install | ✅ `~/Library/Application Support/Claude/...` |
| Cursor | ✅ `~/.cursor/skills/` (global) · `.cursor/skills/` (project) | ✅ `.cursor/mcp.json` |
| Windsurf | ✅ `.windsurf/skills/` | ✅ `.windsurf/mcp.json` |
| GitHub Copilot | ✅ `.github/skills/` | ✅ `.vscode/mcp.json` |
| Cline | ✅ `.cline/skills/` | — |

---

## MCP server installation

When installing an MCP server, agent-kit will:

1. Show you the server definition and what env vars it needs
2. Prompt you for any required values (API keys, endpoints, etc.)
3. Ask permission before writing to each config file
4. Merge the server entry — never overwriting other servers you've already configured

```sh
agent-kit add levi-putna/my-skills --mcp my-server --global
```

---

## Target a specific branch

```sh
agent-kit add owner/repo@develop
```

---

## For developers — publishing your own skills

Anyone can publish a skills repo. agent-kit will work with any public GitHub repo that follows this structure:

```
your-skills-repo/
  skills/
    my-skill/
      SKILL.md
  mcp/
    my-server/
      mcp.json
      README.md
```

### Creating a skill

A skill is a folder with a `SKILL.md` file. The frontmatter tells the agent when to activate it:

```markdown
---
name: code-review
description: Review code for bugs and suggest improvements. Use when asked to review, audit, or check code.
---

# Code Review

When asked to review code, follow these steps:
...
```

You can add supporting files alongside `SKILL.md` — scripts, templates, config files — and they'll be installed together.

### Creating an MCP server definition

An MCP server entry is a folder with an `mcp.json` file:

```json
{
  "name": "my-server",
  "description": "Connects Claude to my service",
  "command": "npx",
  "args": ["-y", "@my-org/my-mcp-server"],
  "env": {
    "API_KEY": {
      "description": "Your API key from example.com/settings",
      "required": true
    }
  }
}
```

The `env` block drives the interactive prompt — users are asked for each value before the config is written.

### Publishing

Push your repo to GitHub (must be public). Users can install from it immediately:

```sh
agent-kit add your-username/your-repo
agent-kit add your-username/your-repo --skill my-skill
```

No registry submission required.

---

## Development

Clone the repo, install dependencies, and run the test suite:

```sh
git clone https://github.com/levi-putna/agent-kit.git
cd agent-kit
npm install
npm test
```

### Run the local CLI

Without installing globally — useful while iterating:

```sh
node bin/cli.js --help
node bin/cli.js list owner/repo
node bin/cli.js add owner/repo --project
```

Or link it globally so the `agent-kit` command points at your local source:

```sh
npm link
agent-kit --help
```

Unlink when you're done:

```sh
npm unlink -g @levi-putna/agent-kit
```

Optional: set `GITHUB_TOKEN` in your environment if you hit GitHub API rate limits during development.

---

## Maintainers — publishing a new version

### First-time setup

Make sure you're logged in to npm under the `@levi-putna` scope:

```sh
npm login
```

Verify the scope is accessible:

```sh
npm whoami
```

### Releasing

1. **Bump the version** in `package.json` following semver — patch for fixes, minor for new features, major for breaking changes:

```sh
npm version patch   # 0.1.0 → 0.1.1
npm version minor   # 0.1.0 → 0.2.0
npm version major   # 0.1.0 → 1.0.0
```

This updates `package.json` and creates a git tag automatically.

2. **Publish to npm** — tests run automatically before publish via `prepublishOnly`:

```sh
npm publish --access public
```

The `--access public` flag is required for scoped packages on the first publish. Subsequent publishes don't need it.

3. **Push the version tag to GitHub:**

```sh
git push && git push --tags
```

### What gets published

The `files` field in `package.json` controls what's included in the npm package:

```
bin/
src/
```

Test files (`*.test.js`) are included in the source but add negligible size. If you want to exclude them:

```json
"files": ["bin", "src/lib", "src/commands", "src/ui"]
```

### Checking what will be published (dry run)

```sh
npm publish --dry-run
```

---

## Requirements

- Node.js 18 or later

---

## License

MIT
