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
