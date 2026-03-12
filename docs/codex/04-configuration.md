# configuration

## `~/.codex/config.toml`

minimum required configuration:

```toml
[features]
multi_agent = true
```

recommended full configuration for subagent-driven development:

```toml
[features]
multi_agent = true

[agents]
max_threads = 6
max_depth = 1

[agents.implementer]
description = "Implementation-focused agent. Follows TDD, implements one task at a time, commits work."
config_file = "agents/implementer.toml"

[agents.spec-reviewer]
description = "Spec compliance reviewer. Verifies code matches requirements exactly — nothing more, nothing less."
config_file = "agents/spec-reviewer.toml"

[agents.code-reviewer]
description = "Code quality reviewer. Reviews for clean code, test coverage, maintainability."
config_file = "agents/code-reviewer.toml"

[agents.explorer]
description = "Read-only codebase explorer for gathering evidence before changes are proposed."
config_file = "agents/explorer.toml"
```

### key settings

| setting | purpose | default |
|---|---|---|
| `multi_agent` | enables `spawn_agent` / `send_input` / `resume_agent` / `wait` / `close_agent` / `spawn_agents_on_csv` | `false` (must enable) |
| `max_threads` | maximum concurrent subagents | 6 |
| `max_depth` | max agent nesting depth | 1 (agents can't spawn sub-agents) |
| `job_max_runtime_seconds` | per-worker timeout for `spawn_agents_on_csv` | 1800 |

## `~/.codex/AGENTS.md`

this file is loaded at the start of every codex session. add the superpowers pipeline to enforce skill usage:

```markdown
# Superpowers Workflow — Mandatory

## Pipeline (follow in order)

1. **Design** — load and follow `$brainstorming` before any code
2. **Planning** — load and follow `$writing-plans` after design approval
3. **Isolation** — load and follow `$using-git-worktrees` before implementation
4. **Execution** — load and follow `$subagent-driven-development`
5. **Testing** — load and follow `$test-driven-development` (RED → GREEN → REFACTOR)
6. **Debugging** — load and follow `$systematic-debugging` before proposing fixes
7. **Review** — load and follow `$requesting-code-review` after completing work
8. **Verification** — load and follow `$verification-before-completion` before claiming done
9. **Finishing** — load and follow `$finishing-a-development-branch` when complete

## Iron Laws (zero exceptions)

1. **TDD**: No production code without a failing test first
2. **Root Cause First**: No fixes without Phase 1 investigation
3. **Evidence Before Claims**: No "done"/"fixed"/"passing" without fresh verification
```

## skill discovery

codex scans these paths for directories containing `SKILL.md` (first match wins per skill name):

| scope | path |
|---|---|
| project (current dir) | `$CWD/.agents/skills/` |
| project (parent) | `$CWD/../.agents/skills/` |
| repository root | `$REPO_ROOT/.agents/skills/` |
| user | `~/.agents/skills/` |
| admin | `/etc/codex/skills/` |
| bundled | ships with codex |

symlinked skill folders are followed. the installer creates:

```
~/.agents/skills/superpowers -> ~/.codex/superpowers-codex/skills/
```

which exposes all 14 skills. they auto-load when the agent's prompt matches a skill's `description` field, or when explicitly referenced with `$skill-name`.

### SKILL.md format

```markdown
---
name: skill-name          # required
description: When to use   # required
---

free-form body (instructions for codex to follow)
```

optional: place `agents/openai.yaml` in the skill folder for metadata, icons, and MCP dependencies.

## AGENTS.md loading hierarchy

codex loads AGENTS.md files in this order (later overrides earlier):

1. **global**: `~/.codex/AGENTS.override.md` → `~/.codex/AGENTS.md`
2. **project**: walk from project root to cwd, each directory checked for `AGENTS.override.md` → `AGENTS.md` → fallback filenames
3. **merge**: files concatenated root-to-cwd (closer to cwd = higher priority)
4. **size cap**: `project_doc_max_bytes` (default 32KB)

## per-project configuration

for project-specific trust levels, add to `config.toml`:

```toml
[projects."/path/to/your/project"]
trust_level = "trusted"
```

for project-specific workflow overrides, create an `AGENTS.md` in the project root. project-level instructions take precedence over global `~/.codex/AGENTS.md`.

you can also set fallback filenames for AGENTS.md discovery:

```toml
project_doc_fallback_filenames = ["TEAM_GUIDE.md", ".agents.md"]
```
