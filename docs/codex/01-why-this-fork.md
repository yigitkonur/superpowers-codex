# why this fork exists

[obra/superpowers](https://github.com/obra/superpowers) is the best agentic workflow system available for coding agents. it enforces design-before-code, test-driven development, two-stage code review, and evidence-based verification through composable skills that trigger automatically.

the problem: every skill was authored for **claude code**. the tool names, dispatch patterns, plan tracking, and skill invocation all use claude code primitives that don't exist in codex cli.

## what doesn't translate directly

| concept | claude code | codex cli |
|---|---|---|
| dispatch a subagent | `Task` tool with `subagent_type` | `spawn_agent` with named role |
| track plan progress | `TodoWrite` tool | `update_plan` tool |
| invoke a skill | `Skill("superpowers:name")` tool | `$name` prefix reference |
| edit a file | `Edit` tool | `apply_patch` tool |
| search files | `Glob` / `Grep` tools | `file_search` / shell `rg` |
| send input to agent | N/A | `send_input` tool |
| resume paused agent | N/A | `resume_agent` tool |
| batch fan-out | N/A | `spawn_agents_on_csv` tool |
| project config | `CLAUDE.md` | `AGENTS.md` |
| enter plan mode | `EnterPlanMode` tool | `/plan` command |

these aren't cosmetic differences. when a skill says "dispatch a Task tool with superpowers:code-reviewer type," a codex agent has no idea what that means. it silently skips the review step or hallucinates a workaround.

## what this fork does

every skill file was rewritten to use codex-native patterns:

- `spawn_agent with role "implementer"` replaces `Task tool (general-purpose)`
- `update_plan` replaces `TodoWrite`
- `$brainstorming` replaces `Skill("superpowers:brainstorming")`
- `AGENTS.md` replaces `CLAUDE.md` in config references
- multi-agent config uses `[features] multi_agent = true` (not `collab = true`)

the workflow logic, iron laws, and quality gates are identical to upstream. only the tool bindings changed.

## why not contribute upstream?

upstream supports 6 platforms (claude code, cursor, codex, opencode, gemini cli, windsurf). adding codex-native patterns inline would clutter every skill file with platform conditionals. a clean fork with a single target is simpler for both maintenance and comprehension.

the `references/codex-tools.md` mapping table exists in upstream for cross-reference. this fork eliminates the need for that translation layer by speaking codex natively.

---

upstream: [obra/superpowers](https://github.com/obra/superpowers) by [@obra](https://github.com/obra)

## what changed

this documents every pattern change from [obra/superpowers](https://github.com/obra/superpowers) (v5.0.1) to this codex-native fork.

### tool pattern replacements

| pattern | upstream (claude code) | this fork (codex) |
|---|---|---|
| dispatch subagent | `Task tool (general-purpose)` | `spawn_agent with role "X"` |
| dispatch code reviewer | `Task tool (superpowers:code-reviewer)` | `spawn_agent with role "code-reviewer"` |
| parallel dispatch | multiple `Task` calls | multiple `spawn_agent` calls |
| batch fan-out | N/A | `spawn_agents_on_csv` |
| wait for result | Task returns inline | `wait` (long-polling, up to 1hr) |
| send input to running agent | N/A | `send_input` |
| resume paused agent | N/A | `resume_agent` |
| free agent slot | automatic | `close_agent` (required) |
| track plan | `TodoWrite` | `update_plan` |
| invoke skill | `Skill("superpowers:X")` | `$X` prefix |
| read file | `Read` tool | shell `cat` / `head` / `tail` |
| write file | `Write` tool | shell heredoc or redirect |
| edit file | `Edit` tool | `apply_patch` |
| find files | `Glob` tool | shell `find` / `fd` / `file_search` |
| search content | `Grep` tool | shell `grep` / `rg` |
| run commands | `Bash` tool | shell tool |
| plan mode | `EnterPlanMode` tool | `/plan` command |
| project config | `CLAUDE.md` | `AGENTS.md` |

### files modified

#### skill files (SKILL.md)

all 14 skill files had tool references updated:

- `brainstorming` — `Invoke` → `Use`, skill refs → `$`, spec reviewer → `spawn_agent`
- `writing-plans` — skill refs → `$`, plan reviewer → `spawn_agent`, Claude Code → Codex
- `subagent-driven-development` — complete rewrite: all flowchart nodes, prompt templates, integration section
- `executing-plans` — `TodoWrite` → `update_plan`, skill refs → `$`, Claude Code → Codex
- `dispatching-parallel-agents` — `Task(...)` code example → `spawn_agent(...)` pattern
- `requesting-code-review` — `superpowers:code-reviewer` → `spawn_agent with role`
- `systematic-debugging` — skill refs → `$`
- `using-git-worktrees` — `CLAUDE.md` → `AGENTS.md` (5 occurrences)
- `receiving-code-review` — `CLAUDE.md` → `AGENTS.md`
- `writing-skills` — skill refs → `$`, `TodoWrite` → `update_plan`, `~/.claude/skills` → `~/.agents/skills/`
- `using-superpowers` — complete rewrite: removed Claude Code/Gemini refs, updated flowchart
- `test-driven-development` — no changes needed (already generic)
- `verification-before-completion` — no changes needed (already generic)
- `finishing-a-development-branch` — no changes needed (already generic)

#### prompt templates

| file | change |
|---|---|
| `implementer-prompt.md` | `Task tool (general-purpose):` → `spawn_agent with role "implementer":` |
| `spec-reviewer-prompt.md` | `Task tool (general-purpose):` → `spawn_agent with role "spec-reviewer":` |
| `code-quality-reviewer-prompt.md` | `Task tool (superpowers:code-reviewer):` → `spawn_agent with role "code-reviewer":` |
| `spec-document-reviewer-prompt.md` | `Task tool (general-purpose):` → `spawn_agent with role "spec-document-reviewer":` |
| `plan-document-reviewer-prompt.md` | `Task tool (general-purpose):` → `spawn_agent with role "plan-document-reviewer":` |

#### reference files

| file | change |
|---|---|
| `codex-tools.md` | complete rewrite with correct tool mapping, multi-agent config template |
| `persuasion-principles.md` | `TodoWrite` → `update_plan` |
| `testing-skills-with-subagents.md` | `superpowers:test-driven-development` → `$test-driven-development` |
| `package.json` (brainstorm server) | "Claude Code" → "Codex CLI" |

#### new files

| file | purpose |
|---|---|
| `install.sh` | bash one-liner installer |
| `cli.js` | node.js interactive installer/uninstaller |
| `package.json` (root) | npm package definition |
| `docs/codex/*` | codex-specific documentation |

---

also ported to factory droid: [superpowers-droid](https://github.com/yigitkonur/superpowers-droid)
