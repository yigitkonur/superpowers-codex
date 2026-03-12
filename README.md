# superpowers-codex

> structured agentic workflows for [OpenAI Codex CLI](https://github.com/openai/codex). fork of [obra/superpowers](https://github.com/obra/superpowers).

## install

```bash
npx superpowers-codex install
```

or with flags:

```bash
npx superpowers-codex install --user       # all sessions
npx superpowers-codex install --project    # this project only
npx superpowers-codex uninstall --user
npx superpowers-codex status
```

the installer creates a symlink from `~/.agents/skills/superpowers` to the skills directory, checks `config.toml` for `multi_agent = true`. safe to re-run.

[installation guide →](docs/codex/06-installation.md)

## what this is

[superpowers](https://github.com/obra/superpowers) is a skill-based development workflow by [@obra](https://github.com/obra). 14 composable skills enforce design-before-code, TDD, two-stage review, and evidence-based verification. the original targets Claude Code.

this fork ports everything to OpenAI Codex CLI, replacing tool names and invocation patterns:

```
claude code                          codex cli
───────────                          ─────────
Task (subagent)                  →   spawn_agent(role="X")
TodoWrite                        →   update_plan
Skill("superpowers:X")           →   $X prefix
CLAUDE.md                        →   AGENTS.md
Edit tool                        →   apply_patch
Glob/Grep                        →   find/rg (shell)
```

[why this fork →](docs/codex/01-why-this-fork.md)

## how it works

skills auto-activate when your task matches their description. you don't invoke them — codex checks before every response.

```
user: "build a login page"
     │
     ▼
 $brainstorming ──→ questions, alternatives, spec doc
     │
     ▼
 $writing-plans ──→ 2-5 min tasks with file paths
     │
     ▼
 $using-git-worktrees ──→ isolated branch
     │
     ▼
 $subagent-driven-development
     │
     ├──→ spawn_agent(implementer) ──→ builds, tests, commits
     │         │
     │    spawn_agent(spec-reviewer) ──→ "matches spec?"
     │         │
     │    spawn_agent(code-reviewer) ──→ "well built?"
     │
     ▼
 $finishing-a-development-branch ──→ merge / PR
```

[architecture →](docs/codex/02-architecture.md)

## vs native codex

codex ships with `spawn_agent`, `send_input`, `resume_agent`, `wait`, `close_agent`. powerful primitives — but primitives without process:

| | raw codex | with superpowers |
|---|---|---|
| design phase | none | socratic brainstorming → spec |
| task granularity | "build the feature" | 2-5 minute steps |
| review | optional | mandatory two-stage (spec → quality) |
| test discipline | optional | enforced RED-GREEN-REFACTOR |
| completion claims | agent says "done" | evidence required (fresh test run) |
| debugging | guess and retry | 4-phase root cause investigation |

[full comparison →](docs/codex/05-vs-native-codex.md)

## skills

14 composable skills, auto-activating:

| skill | when | what |
|---|---|---|
| `$brainstorming` | creative work | socratic design → spec document |
| `$writing-plans` | spec approved | 2-5 min tasks with exact paths |
| `$using-git-worktrees` | plan ready | isolated workspace on new branch |
| `$subagent-driven-development` | plan ready | fresh agent per task + two-stage review |
| `$executing-plans` | plan ready (alt) | single-session with checkpoints |
| `$test-driven-development` | implementation | RED → GREEN → REFACTOR |
| `$systematic-debugging` | bug found | 4-phase root cause analysis |
| `$requesting-code-review` | task complete | dispatch code-reviewer agent |
| `$receiving-code-review` | PR feedback | rigorous technical response |
| `$verification-before-completion` | claiming "done" | evidence before assertions |
| `$finishing-a-development-branch` | all tasks done | merge / PR / keep / discard |
| `$dispatching-parallel-agents` | 2+ independent tasks | concurrent agent dispatch |
| `$writing-skills` | creating skills | TDD for documentation |
| `$using-superpowers` | every session | routing layer |

[skills reference →](docs/codex/03-skills-reference.md)

## configuration

minimum `~/.codex/config.toml`:

```toml
[features]
multi_agent = true
```

recommended — with agent roles:

```toml
[agents]
max_threads = 6

[agents.implementer]
description = "implementation-focused. follows TDD, one task at a time."

[agents.spec-reviewer]
description = "spec compliance. verifies code matches requirements exactly."

[agents.code-reviewer]
description = "code quality. reviews for clean code, maintainability."
```

[configuration guide →](docs/codex/04-configuration.md)

## iron laws

1. no production code without a failing test first
2. no fixes without root cause investigation
3. no "done" without running verification fresh

## known limitations

| missing | impact | workaround |
|---|---|---|
| no pre/post tool hooks | skills can't auto-fire on tool events | AGENTS.md instructions + `$using-superpowers` routing |
| no visual companion | brainstorming server needs a browser | text-based flow works fully |
| no `EnterPlanMode` | no structured plan-mode UI | `$brainstorming` triggers automatically, plans persist to files |
| agent depth limit | `max_depth = 1`, agents can't spawn sub-agents | orchestrator pattern (parent spawns all) |
| description-based activation | no explicit `Skill()` tool call | precise descriptions + `$skill-name` prefix in AGENTS.md |

## docs

| doc | content |
|---|---|
| [01-why-this-fork](docs/codex/01-why-this-fork.md) | motivation, changelog |
| [02-architecture](docs/codex/02-architecture.md) | pipeline, tool mapping |
| [03-skills-reference](docs/codex/03-skills-reference.md) | all 14 skills with triggers |
| [04-configuration](docs/codex/04-configuration.md) | config.toml, AGENTS.md, agent roles |
| [05-vs-native-codex](docs/codex/05-vs-native-codex.md) | superpowers vs raw `spawn_agent` |
| [06-installation](docs/codex/06-installation.md) | install, uninstall, status |

## also available for

- [superpowers-droid](https://github.com/yigitkonur/superpowers-droid) — same 14 skills for Factory Droid, with 5 tool-restricted droids
- [obra/superpowers](https://github.com/obra/superpowers) — the original, for Claude Code

## credits

built on [superpowers](https://github.com/obra/superpowers) by [@obra](https://github.com/obra) (Jesse Vincent). MIT license.
