# skills reference

14 skills, organized by phase. each skill has a `SKILL.md` with yaml frontmatter (`name`, `description`) that drives auto-activation.

## design phase

| skill | trigger | what it does |
|---|---|---|
| `$brainstorming` | any creative/feature/modification request | socratic design refinement: questions → approaches → design sections → spec doc → spec review loop |
| `$writing-plans` | approved spec from brainstorming | breaks spec into 2-5 min tasks with exact file paths, code, and test commands |

## execution phase

| skill | trigger | what it does |
|---|---|---|
| `$subagent-driven-development` | approved plan, subagents available | fresh `spawn_agent` per task with two-stage review (spec then quality) |
| `$executing-plans` | approved plan, no subagents | single-session batch execution with human checkpoints |
| `$dispatching-parallel-agents` | 2+ independent failures | parallel `spawn_agent` dispatch, one per problem domain |

## discipline phase

| skill | trigger | what it does |
|---|---|---|
| `$test-driven-development` | any implementation | RED-GREEN-REFACTOR: write test → watch fail → minimal code → watch pass → refactor |
| `$systematic-debugging` | any bug/failure/unexpected behavior | 4-phase: root cause → pattern analysis → hypothesis testing → fix with test |
| `$verification-before-completion` | about to claim "done" or "fixed" | requires running verification command fresh, reading full output, then claiming |

## review phase

| skill | trigger | what it does |
|---|---|---|
| `$requesting-code-review` | task complete, before proceeding | dispatches `spawn_agent(role="code-reviewer")` with git SHA range |
| `$receiving-code-review` | review feedback arrives | evaluate technically, push back if wrong, no performative agreement |

## infrastructure phase

| skill | trigger | what it does |
|---|---|---|
| `$using-git-worktrees` | before implementation | creates isolated workspace: directory selection → gitignore safety → branch + setup |
| `$finishing-a-development-branch` | all tasks complete | verify tests → present 4 options (merge/PR/keep/discard) → cleanup |

## meta

| skill | trigger | what it does |
|---|---|---|
| `$using-superpowers` | session start | routes to correct skill, defines instruction priority, red flags table |
| `$writing-skills` | creating/editing skills | TDD for documentation: pressure test → write skill → close loopholes |

## key files per skill

```
skills/
├── brainstorming/
│   ├── SKILL.md
│   ├── spec-document-reviewer-prompt.md
│   ├── visual-companion.md
│   └── scripts/              (node.js brainstorm server)
├── writing-plans/
│   ├── SKILL.md
│   └── plan-document-reviewer-prompt.md
├── subagent-driven-development/
│   ├── SKILL.md
│   ├── implementer-prompt.md
│   ├── spec-reviewer-prompt.md
│   └── code-quality-reviewer-prompt.md
├── systematic-debugging/
│   ├── SKILL.md
│   ├── root-cause-tracing.md
│   ├── defense-in-depth.md
│   └── condition-based-waiting.md
├── test-driven-development/
│   ├── SKILL.md
│   └── testing-anti-patterns.md
├── writing-skills/
│   ├── SKILL.md
│   ├── testing-skills-with-subagents.md
│   └── persuasion-principles.md
└── [other skills]/
    └── SKILL.md
```
