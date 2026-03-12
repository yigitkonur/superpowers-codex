# superpowers-codex

Codex-native fork of [obra/superpowers](https://github.com/obra/superpowers) — 14 composable skills that turn Codex CLI's multi-agent primitives into a structured software development workflow.

## Install

```bash
npx superpowers-codex install
```

Interactive. Shows each step. Detects existing installs. Safe to re-run.

Or with flags:

```bash
npx superpowers-codex install --global    # ~/.agents/skills/ (user-level)
npx superpowers-codex install --project   # .agents/skills/   (project-level)
```

## What This Is

[obra/superpowers](https://github.com/obra/superpowers) is a skill-based agentic workflow for Claude Code. It enforces design-before-code, TDD, two-stage code review, and evidence-based verification through 14 composable skills.

This fork ports every skill to work natively with **OpenAI Codex CLI** — replacing Claude Code tool patterns with Codex equivalents:

```
  Claude Code                    Codex CLI
  ───────────                    ─────────
  Task tool (subagent_type)  →   spawn_agent(role="X")
  TodoWrite                  →   update_plan
  Skill("superpowers:X")     →   $X prefix
  CLAUDE.md                  →   AGENTS.md
  Edit tool                  →   apply_patch
```

[Why this fork exists →](docs/codex/01-why-fork.md)

## How It Differs from Native Codex Multi-Agent

Codex ships with `spawn_agent`, `wait`, and `close_agent`. Powerful primitives. But primitives without process:

```
  Raw Codex                          With Superpowers
  ─────────                          ────────────────

  "build feature X"                  "build feature X"
       │                                  │
       v                                  v
  agent writes code              $brainstorming
       │                           questions → approaches → spec
       v                                  │
  maybe spawns a helper                   v
       │                          $writing-plans
       v                           2-5 min tasks with exact paths
  "done"                                  │
  (no verification)                       v
                                  $subagent-driven-development
                                   per task:
                                     spawn_agent(implementer)
                                     spawn_agent(spec-reviewer)
                                     spawn_agent(code-reviewer)
                                          │
                                          v
                                  $finishing-a-development-branch
                                   verify → merge/PR/keep/discard
```

| aspect | raw codex | with superpowers |
|---|---|---|
| design validation | none | mandatory spec review loop |
| task granularity | "build the feature" | 2-5 minute steps |
| test discipline | optional | iron law: no code without failing test |
| code review | none | two-stage: spec compliance, then quality |
| verification | agent says "done" | fresh test run + evidence |
| debugging | guess and retry | 4-phase root cause investigation |
| agent roles | generic | typed: implementer, spec-reviewer, code-reviewer |

[Full comparison →](docs/codex/02-vs-native-codex.md)

## The Pipeline

Every non-trivial task follows this pipeline. Skills fire automatically.

```
  $brainstorming ──→ $writing-plans ──→ $subagent-driven-development ──→ $finishing
     design             tasks              implement + review              merge
```

Supporting skills fire within the pipeline:

- `$using-git-worktrees` — isolation before implementation
- `$test-driven-development` — RED → GREEN → REFACTOR
- `$systematic-debugging` — root cause before fixes
- `$requesting-code-review` — quality gate between tasks
- `$verification-before-completion` — evidence before claims

[Full pipeline walkthrough →](docs/codex/03-pipeline.md)

## The Three Iron Laws

1. **TDD** — No production code without a failing test first
2. **Root Cause First** — No fixes without Phase 1 investigation
3. **Evidence Before Claims** — No "done" without running verification fresh

## Skills Reference

| phase | skill | what it does |
|---|---|---|
| design | `$brainstorming` | socratic design refinement → spec document |
| design | `$writing-plans` | breaks spec into 2-5 min tasks with exact paths |
| execution | `$subagent-driven-development` | fresh agent per task + two-stage review |
| execution | `$executing-plans` | single-session batch execution |
| execution | `$dispatching-parallel-agents` | parallel agents for independent problems |
| discipline | `$test-driven-development` | RED-GREEN-REFACTOR cycle |
| discipline | `$systematic-debugging` | 4-phase root cause investigation |
| discipline | `$verification-before-completion` | evidence before claims |
| review | `$requesting-code-review` | dispatches code-reviewer agent |
| review | `$receiving-code-review` | evaluates feedback technically |
| infra | `$using-git-worktrees` | isolated workspace on new branch |
| infra | `$finishing-a-development-branch` | merge / PR / keep / discard |
| meta | `$using-superpowers` | routes to correct skill at session start |
| meta | `$writing-skills` | TDD for documentation |

[Full skills reference →](docs/codex/05-skills-reference.md)

## Configuration

Minimum `~/.codex/config.toml`:

```toml
[features]
multi_agent = true
```

Recommended — with agent roles:

```toml
[features]
multi_agent = true

[agents]
max_threads = 6

[agents.implementer]
description = "Implementation-focused agent. Follows TDD, implements one task at a time."

[agents.spec-reviewer]
description = "Spec compliance reviewer. Verifies code matches requirements exactly."

[agents.code-reviewer]
description = "Code quality reviewer. Reviews for clean code, maintainability."
```

Add the pipeline to `~/.codex/AGENTS.md` — see [configuration docs →](docs/codex/06-configuration.md)

## What Changed from Upstream

| pattern | upstream (claude code) | this fork (codex) |
|---|---|---|
| dispatch subagent | `Task` tool | `spawn_agent` with role |
| track plan | `TodoWrite` | `update_plan` |
| invoke skill | `Skill("superpowers:X")` | `$X` prefix |
| project config | `CLAUDE.md` | `AGENTS.md` |

All 14 skill files, 5 prompt templates, and supplementary references updated.

[Full change log →](docs/codex/04-changes-from-upstream.md)

## Uninstall

```bash
npx superpowers-codex uninstall
```

Removes symlinks. Optionally removes the cloned repo. Config left for you to clean up.

## Status

```bash
npx superpowers-codex status
```

Shows symlink state, skill count, and config status.

## Credits

Original [superpowers](https://github.com/obra/superpowers) by [Jesse Vincent (obra)](https://github.com/obra). If this has helped you, consider [sponsoring his work](https://github.com/sponsors/obra).

## License

MIT — see [LICENSE](LICENSE)
