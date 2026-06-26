# @levi-putna/agent-kit

A configuration manager for AI coding agents. Install skills and MCP servers from any public GitHub repo into Claude, Cursor, Windsurf, and other agents — globally or per project.

[![GitHub](https://img.shields.io/github/stars/levi-putna/agent-kit?style=social)](https://github.com/levi-putna/agent-kit) [![npm version](https://img.shields.io/npm/v/@levi-putna/agent-kit)](https://www.npmjs.com/package/@levi-putna/agent-kit) [![npm downloads](https://img.shields.io/npm/dm/@levi-putna/agent-kit)](https://www.npmjs.com/package/@levi-putna/agent-kit) [![Node.js 18+](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)

**Requirements:** Node.js 18 or later

---

## Table of contents

1. [For users](#for-users) — install and use agent-kit with any skills repo
2. [For skill & MCP developers](#for-skill--mcp-developers) — publish your own skills and MCP definitions
3. [For agent-kit developers](#for-agent-kit-developers) — run, test, and publish the CLI itself

---

## For users

### Install

```sh
npm install -g @levi-putna/agent-kit
```

Or run without installing:

```sh
npx @levi-putna/agent-kit add owner/repo
```

### Commands

| Command | Description |
| ------- | ----------- |
| `agent-kit list <owner/repo>` | Browse skills and MCP servers available in a repo |
| `agent-kit add <owner/repo> [options]` | Install skills and/or MCP servers |
| `agent-kit installed` | List what is installed in the current project or globally |
| `agent-kit update` | Pull the latest versions of project-installed skills from source repos |
| `agent-kit remove <name>` | Remove a skill or MCP server by name |

### Using a skills repo

Point agent-kit at any public GitHub repo that follows the [expected layout](#repository-layout). The repo is referenced as `owner/repo`:

```sh
agent-kit list owner/repo
agent-kit add owner/repo
```

To use a specific branch instead of `main`:

```sh
agent-kit add owner/repo@develop
```

### `add` options

| Option | Short | Description |
| ------ | ----- | ----------- |
| `--skill <name>` | | Install a specific skill (skips the interactive picker) |
| `--mcp <name>` | | Install a specific MCP server (skips the interactive picker) |
| `--global` | `-g` | Install globally — available across all projects |
| `--project` | `-p` | Install to the current project |
| `--agent <name>` | | Target a specific agent (use with `--global` or `--project`) |

If you omit `--global` and `--project`, agent-kit detects which agents are present in your project (`.claude`, `.cursor`, `.windsurf`, etc.) and walks you through scope and selection interactively.

#### Examples

```sh
# Interactive — browse and pick skills/MCP servers
agent-kit add owner/repo

# Install a specific skill
agent-kit add owner/repo --skill code-review

# Install a specific MCP server
agent-kit add owner/repo --mcp postgres

# Install globally (prompts for Claude Code and/or Cursor)
agent-kit add owner/repo --global

# Install globally to Cursor only
agent-kit add owner/repo --skill code-review --global --agent cursor

# Install to the current project
agent-kit add owner/repo --project

# Install to a specific project agent
agent-kit add owner/repo --skill code-review --project --agent windsurf
```

### Global vs project installs

**Global** — skills are written directly to your user directory:

- `~/.claude/skills/` — Claude Code and Claude desktop app
- `~/.cursor/skills/` — Cursor (all projects)

**Project** — skills are written to `.agents/skills/` with symlinks from each agent directory you choose. Agent directories are created automatically if they do not exist yet. An `agent-kit-lock.json` file is created so teammates can reproduce the same setup.

```sh
agent-kit add owner/repo --project
agent-kit update    # refresh project skills from their source repos
```

### Managing installed skills

```sh
agent-kit installed          # list what's installed
agent-kit update             # pull latest versions from source repos (project scope)
agent-kit remove code-review # remove a skill or MCP server by name
```

### MCP server installation

When installing an MCP server, agent-kit will:

1. Show you the server definition and what env vars it needs
2. Prompt you for any required values (API keys, endpoints, etc.)
3. Ask permission before writing to each config file
4. Merge the server entry — never overwriting other servers you have already configured

```sh
agent-kit add owner/repo --mcp my-server --global
```

### Supported agents

| Agent | Skills | MCP config |
| ----- | ------ | ---------- |
| Claude Code | `~/.claude/skills/` (global) · `.claude/skills/` (project) | `~/.claude.json` · `.mcp.json` |
| Claude Desktop | via global install | `~/Library/Application Support/Claude/...` |
| Cursor | `~/.cursor/skills/` (global) · `.cursor/skills/` (project) | `.cursor/mcp.json` |
| Windsurf | `.windsurf/skills/` | `.windsurf/mcp.json` |
| GitHub Copilot | `.github/skills/` | `.vscode/mcp.json` |
| Cline | `.cline/skills/` | — |
| OpenCode | `.opencode/skills/` | — |

Valid values for `--agent`: `claude`, `cursor`, `windsurf`, `copilot`, `cline`, `opencode`.

---

## For skill & MCP developers

Publish skills and MCP server definitions in a GitHub repo. Users install them with agent-kit — no npm package, no registry, no approval process.

```sh
agent-kit add your-username/your-repo
agent-kit add your-username/your-repo --skill my-skill
agent-kit add your-username/your-repo --mcp my-server
```

### How publishing works

1. You create a public GitHub repo with a `skills/` and/or `mcp/` directory.
2. Users run `agent-kit add your-username/your-repo`.
3. agent-kit fetches the repo via the GitHub API and installs the selected items into the user's agent directories.
4. When you push updates, users can run `agent-kit update` to pull the latest skill files (for project installs tracked in `agent-kit-lock.json`).

There is nothing to submit or register — if the repo is public and follows the layout below, it works immediately.

### Quick start

Create a minimal repo and publish your first skill in a few minutes:

```sh
mkdir my-agent-skills && cd my-agent-skills
git init

mkdir -p skills/hello-world
cat > skills/hello-world/SKILL.md << 'EOF'
---
name: hello-world
description: A simple greeting skill. Use when the user asks for a hello-world example.
---

# Hello World

Respond with a friendly greeting and a one-line tip about agent skills.
EOF

git add . && git commit -m "Add hello-world skill"
gh repo create my-agent-skills --public --source=. --push
```

Verify it is discoverable, then install it locally:

```sh
agent-kit list your-username/my-agent-skills
agent-kit add your-username/my-agent-skills --skill hello-world --project
```

### Repository requirements

| Requirement | Details |
| ----------- | ------- |
| Visibility | Must be **public**. Private repos are not supported unless the user sets `GITHUB_TOKEN`. |
| Default branch | `main` is assumed. If your default branch is different, users must pass `@branch` (e.g. `owner/repo@develop`). |
| Layout | Skills live under `skills/<name>/`. MCP definitions live under `mcp/<name>/`. |
| Naming | Folder names become install names. Use lowercase, hyphenated names (e.g. `code-review`, `postgres`). |

### Repository layout

```
your-skills-repo/
  skills/
    code-review/
      SKILL.md              # required
      checklist.md          # optional supporting file
      review-prompt.txt     # optional supporting file
    deploy/
      SKILL.md
  mcp/
    postgres/
      mcp.json              # required
      README.md             # optional — documentation for humans browsing the repo
```

- **Skills** — each subfolder of `skills/` that contains a `SKILL.md` is installable. The folder name is what users pass to `--skill`.
- **MCP servers** — each subfolder of `mcp/` that contains an `mcp.json` is installable. The folder name is what users pass to `--mcp` and becomes the key in the agent's MCP config.
- **Supporting files** — any file in the same folder as `SKILL.md` is copied alongside it during install. Keep supporting files in the skill folder root (nested subdirectories are not fetched).

You can publish skills only, MCP only, or both in the same repo.

---

### Creating a skill

A skill teaches an AI agent how to handle a specific task. It is a folder with a `SKILL.md` file and optional supporting files.

#### SKILL.md format

```markdown
---
name: code-review
description: Review code for bugs, security issues, and style problems. Use when asked to review, audit, or check code.
---

# Code Review

When asked to review code, follow these steps:

1. Read the changed files and understand the intent.
2. Check for bugs, edge cases, and security issues.
3. Note style or maintainability concerns.
4. Summarise findings with severity (critical, warning, suggestion).
```

#### Frontmatter fields

| Field | Required | Description |
| ----- | -------- | ----------- |
| `name` | Recommended | Skill identifier. Should match the folder name. |
| `description` | **Required** | Tells the agent **when** to activate this skill. Be specific — include trigger phrases the user might say. |

The `description` is the most important field. Agents read it to decide whether to load the skill. A vague description like "Helps with code" will rarely activate. A good description names the task and lists example triggers:

```yaml
description: Review pull requests for bugs and security issues. Use when asked to review a PR, audit code, or check for problems.
```

#### Writing effective skill content

- **Start with the goal** — state what the agent should accomplish in the first paragraph.
- **Use numbered steps** for multi-step workflows.
- **Include examples** of good and bad output where helpful.
- **Reference supporting files** in the skill body so the agent knows they exist (e.g. "Use the checklist in `checklist.md`").
- **Keep it focused** — one skill per task. Split large workflows into separate skills.

#### Example: skill with supporting files

```
skills/
  api-design/
    SKILL.md
    rest-conventions.md
    example-response.json
```

```markdown
---
name: api-design
description: Design REST API endpoints and request/response shapes. Use when asked to design, plan, or review an API.
---

# API Design

Follow the conventions in `rest-conventions.md`.

When proposing a new endpoint, include:
- HTTP method and path
- Request body schema
- Response body schema (use `example-response.json` as a template)
- Error cases
```

#### What gets installed

When a user installs your skill:

- **Global install** — files are written to `~/.claude/skills/<name>/` and/or `~/.cursor/skills/<name>/`.
- **Project install** — files are written to `.agents/skills/<name>/` with symlinks from each chosen agent directory (`.cursor/skills/`, `.claude/skills/`, etc.). An entry is added to `agent-kit-lock.json` so teammates can reproduce the setup.

---

### Creating an MCP server definition

An MCP definition tells agent-kit how to configure an MCP server in the user's agent. You are **not** publishing the MCP server binary itself — you are publishing a recipe that points to an npm package, executable, or script the user already has (or that `npx` can fetch).

#### mcp.json format

```json
{
  "name": "postgres",
  "description": "Query and manage a PostgreSQL database",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-postgres"],
  "env": {
    "POSTGRES_CONNECTION_STRING": {
      "description": "PostgreSQL connection string (e.g. postgresql://user:pass@localhost:5432/mydb)",
      "required": true
    }
  }
}
```

#### Field reference

| Field | Required | Description |
| ----- | -------- | ----------- |
| `name` | Recommended | Server identifier. Should match the folder name. |
| `description` | Recommended | Shown in the install picker. Explain what the server does. |
| `command` | **Required** | Executable to run (e.g. `npx`, `node`, `python`, `/path/to/binary`). |
| `args` | Optional | Array of command-line arguments. Defaults to `[]`. |
| `env` | Optional | Environment variables the user must (or can) provide at install time. |

#### Environment variable schema

Each key under `env` maps to an object with:

| Field | Required | Description |
| ----- | -------- | ----------- |
| `description` | Recommended | Shown to the user during the interactive prompt. Explain where to find the value. |
| `required` | Optional | If `true`, the user must provide a value before install continues. Defaults to optional. |

```json
"env": {
  "API_KEY": {
    "description": "API key from https://example.com/settings/api",
    "required": true
  },
  "API_URL": {
    "description": "API base URL (defaults to https://api.example.com)",
    "required": false
  }
}
```

#### What agent-kit writes

During install, agent-kit prompts for env values, then merges an entry into the user's MCP config. The written entry looks like:

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://..."
      }
    }
  }
}
```

agent-kit **merges** into existing config files — it never removes other MCP servers the user has configured.

| Install scope | Config files updated |
| ------------- | -------------------- |
| Global | `~/.claude.json`, Claude Desktop config |
| Project | `.mcp.json`, `.cursor/mcp.json`, `.windsurf/mcp.json`, `.vscode/mcp.json` (per agent chosen) |

#### MCP examples

**npm package via npx:**

```json
{
  "name": "filesystem",
  "description": "Read and write files on the local filesystem",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/me/projects"]
}
```

**Local script:**

```json
{
  "name": "my-tool",
  "description": "Custom internal tool",
  "command": "node",
  "args": ["./dist/index.js"],
  "env": {
    "AUTH_TOKEN": {
      "description": "Bearer token from the internal dashboard",
      "required": true
    }
  }
}
```

Add a `README.md` in the MCP folder to document setup steps, links to your npm package, and where users can get API keys. This is for humans browsing your repo — agent-kit uses `mcp.json` for install.

---

### Publishing step by step

1. **Create the repo** on GitHub (public).
2. **Add your skills and/or MCP definitions** following the layout above.
3. **Commit and push** to your default branch (`main` unless you document otherwise).
4. **Test the install** yourself (see below).
5. **Share the install command** with users:

```sh
# Browse what's available
agent-kit list your-username/your-repo

# Install everything interactively
agent-kit add your-username/your-repo

# Install specific items
agent-kit add your-username/your-repo --skill code-review
agent-kit add your-username/your-repo --mcp postgres

# Install from a non-default branch
agent-kit add your-username/your-repo@develop
```

6. **Ship updates** by pushing to GitHub. Users with project installs can refresh skills with:

```sh
agent-kit update
```

---

### Testing before you share

Run through this checklist on your own machine before sharing your repo:

```sh
# 1. Confirm agent-kit can see your skills and MCP servers
agent-kit list your-username/your-repo

# 2. Install a skill to a test project
mkdir /tmp/agent-kit-test && cd /tmp/agent-kit-test
agent-kit add your-username/your-repo --skill my-skill --project

# 3. Verify files landed in the right place
ls .agents/skills/my-skill/
cat .agents/skills/my-skill/SKILL.md

# 4. Install an MCP server and confirm the config was merged
agent-kit add your-username/your-repo --mcp my-server --project --agent cursor
cat .cursor/mcp.json

# 5. Test updating after you push a change
agent-kit update
```

**Verify:**

- [ ] `agent-kit list` shows all your skills and MCP servers
- [ ] `SKILL.md` frontmatter has a clear, specific `description`
- [ ] Supporting files appear alongside `SKILL.md` after install
- [ ] MCP env prompts show helpful descriptions
- [ ] MCP config merges without removing existing servers
- [ ] Folder names match what you document in your README

---

### Troubleshooting

| Problem | Likely cause | Fix |
| ------- | ------------ | --- |
| `No skills or MCP servers found` | Repo is private, wrong branch, or missing `skills/` / `mcp/` directory | Make the repo public, confirm the branch, check folder names |
| `Skill "foo" not found` | Folder name mismatch | Folder must be `skills/foo/` and users pass `--skill foo` |
| `Could not fetch skill` | Missing `SKILL.md` | Every skill folder needs a `SKILL.md` file |
| Supporting files missing after install | Files are in a nested subdirectory | Move files to the skill folder root — only top-level files are fetched |
| Users on a different default branch | agent-kit defaults to `main` | Tell users to use `owner/repo@your-branch` |
| Rate limit errors during development | Unauthenticated GitHub API limits | Set `GITHUB_TOKEN` in the environment |

---

### Best practices

- **One repo or many** — a single `my-skills` repo works well for a personal collection; separate repos make sense for large or independently versioned packages.
- **Document your repo** — add a README explaining what each skill does and what MCP servers need (API keys, accounts, etc.).
- **Version with git** — tag releases (`v1.0.0`) if you want users to pin to a branch or tag via `owner/repo@v1.0.0`.
- **Keep secrets out of the repo** — use the `env` block in `mcp.json` to prompt users for API keys at install time. Never commit real credentials.
- **Test across agents** — if your skill is agent-agnostic, test a project install with both Cursor and Claude Code to confirm symlinks work.

---

## For agent-kit developers

This section is for contributors and maintainers working on the `@levi-putna/agent-kit` package itself.

### Clone and install

```sh
git clone https://github.com/levi-putna/agent-kit.git
cd agent-kit
npm install
```

### Run tests

```sh
npm test
```

Tests run automatically before every `npm publish` via the `prepublishOnly` script.

### Run the CLI locally

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

Unlink when you are done:

```sh
npm unlink -g @levi-putna/agent-kit
```

**Tip:** Set `GITHUB_TOKEN` in your environment if you hit GitHub API rate limits during development.

### Project structure

```
agent-kit/
  bin/cli.js          # CLI entry point
  src/
    commands/         # add, list, installed, remove, update
    lib/              # agents, github, installer, lockfile, mcp
    ui/               # interactive prompts
```

### Publishing a new version

These steps apply to anyone with publish access to the npm package scope.

#### First-time setup

Log in to npm with an account that has publish access:

```sh
npm login
npm whoami
```

#### Release checklist

1. **Bump the version** in `package.json` following semver:

```sh
npm version patch   # 0.1.0 → 0.1.1  (bug fixes)
npm version minor   # 0.1.0 → 0.2.0  (new features)
npm version major   # 0.1.0 → 1.0.0  (breaking changes)
```

This updates `package.json` and creates a git tag automatically.

2. **Publish to npm** — tests run automatically via `prepublishOnly`:

```sh
npm publish --access public
```

The `--access public` flag is required for scoped packages on the first publish. Subsequent publishes do not need it if `publishConfig.access` is already set to `"public"`.

3. **Push the version tag to GitHub:**

```sh
git push && git push --tags
```

#### What gets published

The `files` field in `package.json` controls the npm package contents:

```
bin/
src/
```

#### Dry run

Preview what will be included before publishing:

```sh
npm publish --dry-run
```

---

## License

MIT
