# Codex Tool Mapping

Skills reference Claude Code tool names. When you encounter these in a skill, use your Codex CLI equivalent:

## Core Tool Mapping

| Skill references | Codex equivalent | Notes |
|-----------------|------------------|-------|
| `Task` tool (dispatch subagent) | `spawn_agent` | Requires `features.multi_agent = true` in config.toml |
| Multiple `Task` calls (parallel) | Multiple `spawn_agent` calls | Max 6 concurrent (configurable via `agents.max_threads`) |
| Task returns result | `wait` | Long-polling, up to 1 hour per call |
| Task completes | `close_agent` | Frees thread slot when done |
| Batch fan-out to N workers | `spawn_agents_on_csv` | CSV-driven parallel execution with `report_agent_job_result` |
| `TodoWrite` (task tracking) | `update_plan` | Native plan tracking with checkboxes |
| `Skill` tool (invoke a skill) | `$skill-name` | Skills auto-load when description matches; or reference with `$` prefix |
| `Read` (read file) | Shell: `cat`, `head`, `tail` | Or use file_search for discovery |
| `Write` (create file) | Shell: write via heredoc or redirect | Or `apply_patch` for diffs |
| `Edit` (modify file) | `apply_patch` | Diff-based patching |
| `Glob` (find files) | Shell: `find`, `fd`, `ls` | Or file_search tool |
| `Grep` (search content) | Shell: `grep`, `rg` | Via shell tool |
| `Bash` (run commands) | Shell tool | Native, stable |
| `WebFetch` (fetch URLs) | Web search tool | Native |
| `EnterPlanMode` | `/plan` command | Native Codex plan mode |

## Multi-Agent Configuration

Add to `~/.codex/config.toml`:

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

## Subagent Dispatch Pattern

Instead of Claude Code's Task tool:
```
# Claude Code pattern (DO NOT USE)
Task tool (general-purpose):
  description: "..."
  prompt: |
    ...

# Codex pattern (USE THIS)
spawn_agent with role "implementer":
  prompt: |
    ...
```

After dispatch, use `wait` to get results, then `close_agent` to free the slot.

## Skill Invocation Pattern

Instead of Claude Code's Skill tool:
```
# Claude Code pattern (DO NOT USE)
Use the Skill tool to invoke superpowers:brainstorming

# Codex pattern (USE THIS)
Follow the $brainstorming skill
```
