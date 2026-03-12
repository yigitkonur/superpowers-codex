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
| `multi_agent` | enables `spawn_agent` / `wait` / `close_agent` | `false` (must enable) |
| `max_threads` | maximum concurrent subagents | 6 |
| `max_depth` | max agent nesting depth | 1 (agents can't spawn sub-agents) |

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

codex discovers skills by scanning `~/.agents/skills/` for directories containing `SKILL.md`. the symlink created by the installer:

```
~/.agents/skills/superpowers -> ~/.codex/superpowers-codex/skills/
```

exposes all 14 skills. they auto-load when the agent's prompt matches a skill's `description` field, or when explicitly referenced with `$skill-name`.

## per-project configuration

for project-specific trust levels, add to `config.toml`:

```toml
[projects."/path/to/your/project"]
trust_level = "trusted"
```

for project-specific workflow overrides, create an `AGENTS.md` in the project root. project-level instructions take precedence over global `~/.codex/AGENTS.md`.
