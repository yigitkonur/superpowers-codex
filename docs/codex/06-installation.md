# installation

## quick install

```bash
npx superpowers-codex install
```

interactive. asks user-level vs project-level. shows each step.

## install options

### user-level (recommended)

available in all codex sessions:

```bash
npx superpowers-codex install --user
```

creates symlink: `~/.agents/skills/superpowers` → skills directory.

### project-level

available only in the current project:

```bash
npx superpowers-codex install --project
```

creates symlink: `.agents/skills/superpowers` → skills directory.

## one-liner (macos)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/yigitkonur/superpowers-codex/main/install.sh)"
```

downloads `cli.js` to a temp directory and runs it.

## uninstall

```bash
npx superpowers-codex uninstall            # all scopes
npx superpowers-codex uninstall --user     # user-level only
npx superpowers-codex uninstall --project  # project-level only
```

removes symlinks. optionally removes cloned repo. leaves config.toml for you.

## status

```bash
npx superpowers-codex status
```

shows symlink state, skill count, and config.toml status.

## re-install safety

the installer is idempotent. running it again detects the existing symlink and updates it if needed. no data loss.

## prerequisites

| tool | required | notes |
|------|----------|-------|
| `git` | yes | for cloning |
| `node` | yes (>=18) | for the installer |
| `codex` | recommended | superpowers installs without it, but needs codex to run |

## configuration

### config.toml

the installer checks `~/.codex/config.toml` for `multi_agent = true` and offers to add it.

### AGENTS.md

add the superpowers pipeline to `~/.codex/AGENTS.md`:

```markdown
## superpowers workflow

before responding to any task, check for applicable superpowers skills.
skills auto-activate when your task matches their description, or reference with $skill-name.

pipeline: $brainstorming → $writing-plans → $using-git-worktrees →
$subagent-driven-development → $test-driven-development →
$requesting-code-review → $verification-before-completion →
$finishing-a-development-branch

iron laws:
1. no production code without a failing test first
2. no fixes without root cause investigation
3. no completion claims without running verification fresh
```

### skill discovery

codex scans these paths for skills:

| scope | path |
|---|---|
| project | `$CWD/.agents/skills/` |
| project parent | `$CWD/../.agents/skills/` |
| repo root | `$REPO_ROOT/.agents/skills/` |
| user | `~/.agents/skills/` |
