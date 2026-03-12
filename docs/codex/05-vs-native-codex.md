# superpowers vs native codex multi-agent

codex cli ships with `spawn_agent`, `wait`, and `close_agent`. these are powerful primitives. but primitives without process are like having a hammer, nails, and lumber without a blueprint.

## raw codex multi-agent

```
user: "build feature X"
  |
  v
agent writes code
  |
  v
maybe spawns a helper agent
  |
  v
"done" (no verification)
```

what you get:
- code that might work
- no design review
- no spec compliance check
- no structured test discipline
- no evidence that "done" means done

## superpowers on codex

```
user: "build feature X"
  |
  v
$brainstorming
  |  ask questions one at a time
  |  propose 2-3 approaches
  |  present design in sections
  |  write spec, dispatch spec-document-reviewer via spawn_agent
  |  user approves written spec
  v
$writing-plans
  |  break into 2-5 min tasks
  |  each task has exact file paths, code, test commands
  |  dispatch plan-document-reviewer via spawn_agent
  v
$subagent-driven-development
  |  for each task:
  |    spawn_agent(role="implementer") — implements + TDD + self-review
  |    spawn_agent(role="spec-reviewer") — verifies spec compliance
  |    spawn_agent(role="code-reviewer") — verifies code quality
  |    update_plan — mark task complete
  v
$finishing-a-development-branch
     verify all tests pass
     present 4 options: merge / PR / keep / discard
```

## the difference in practice

| aspect | raw codex | superpowers on codex |
|---|---|---|
| design validation | none | mandatory spec review loop |
| task granularity | "build the feature" | 2-5 minute bite-sized steps |
| test discipline | optional | iron law: no code without failing test first |
| code review | none | two-stage: spec compliance then quality |
| verification | agent says "done" | fresh test run + evidence before claims |
| debugging | guess and retry | 4-phase root cause investigation |
| agent roles | generic | typed: implementer, spec-reviewer, code-reviewer |
| plan tracking | ad hoc | `update_plan` with checkbox progress |
| context pollution | one agent does everything | fresh agent per task |

## what superpowers does NOT replace

superpowers uses codex's native tools. it does not:
- replace `spawn_agent` — it wraps it with process
- replace `update_plan` — it defines when and how to use it
- add new codex capabilities — it constrains when existing ones fire
- modify codex internals — it's pure skill files (markdown)

think of it as a methodology layer on top of infrastructure.

## the three iron laws

these are enforced by skills, not by codex itself:

1. **tdd**: no production code without a failing test first. code before test = delete it.
2. **root cause first**: no fixes without phase 1 investigation. 3+ failed fixes = escalate.
3. **evidence before claims**: no "done" / "fixed" / "passing" without running verification fresh.

each law has a dedicated skill with explicit rationalization counters — tables of excuses agents commonly make, paired with why each excuse is wrong.
