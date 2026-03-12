# the superpowers pipeline

every non-trivial task follows this pipeline. skills trigger automatically when the agent's prompt matches their description. the agent does not choose to use them — it must.

## pipeline overview

```
  +-----------------+     +-----------------+     +------------------+
  |  $brainstorming |---->| $writing-plans  |---->| $subagent-driven |
  |                 |     |                 |     |  -development    |
  |  design gate    |     |  task breakdown |     |  per-task loop   |
  +-----------------+     +-----------------+     +------------------+
                                                         |
                                                         v
                                              +---------------------+
                                              | $finishing-a-       |
                                              |  development-branch |
                                              |  merge / PR / keep  |
                                              +---------------------+
```

supporting skills fire within the pipeline:

```
  $using-git-worktrees      fires before implementation (isolation)
  $test-driven-development   fires during implementation (TDD cycle)
  $systematic-debugging      fires on any failure (root cause first)
  $requesting-code-review    fires between tasks (quality gate)
  $verification-before-      fires before any "done" claim
   completion
```

## phase 1: brainstorming

**trigger:** any creative, feature, component, or modification request.

**hard gate:** no code, no scaffolding, no implementation until design is approved.

**process:**
1. explore project context (files, docs, recent commits)
2. offer visual companion if topic involves visual questions
3. ask clarifying questions — one at a time
4. propose 2-3 approaches with trade-offs and recommendation
5. present design in sections, get approval after each
6. write spec to `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`
7. dispatch `spec-document-reviewer` via `spawn_agent` — fix and re-dispatch until approved
8. user reviews the written spec
9. hand off to `$writing-plans`

**terminal state:** the only valid next skill is `$writing-plans`.

## phase 2: writing plans

**trigger:** approved spec from brainstorming.

**output:** `docs/superpowers/plans/YYYY-MM-DD-<feature-name>.md`

**structure:**
- file map: every file to create/modify with responsibilities
- tasks broken into 2-5 minute steps
- each step has exact file paths, complete code, and verification commands
- TDD steps are explicit: write test → run (expect fail) → implement → run (expect pass) → commit
- plan review loop: dispatch `plan-document-reviewer` via `spawn_agent` per chunk

## phase 3: subagent-driven development

**trigger:** approved plan from writing-plans.

**per-task cycle:**

```
  spawn_agent(role="implementer")
    |
    |  implement + TDD + self-review + commit
    |  report: DONE | DONE_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED
    v
  spawn_agent(role="spec-reviewer")
    |
    |  read actual code (do NOT trust implementer report)
    |  verify: nothing missing, nothing extra
    |  if issues: implementer fixes → re-review
    v
  spawn_agent(role="code-reviewer")     [only after spec ✅]
    |
    |  clean code, test coverage, maintainability
    |  if issues: implementer fixes → re-review
    v
  update_plan — mark task complete
```

**constraints:**
- never dispatch multiple implementers in parallel (file conflicts)
- never start code review before spec review passes
- never skip review loops
- fresh agent per task (no context pollution)

## phase 4: finishing

**trigger:** all tasks complete and verified.

**process:**
1. run full test suite
2. present exactly 4 options: merge locally / push + PR / keep branch / discard
3. clean up worktree (except for "keep" option)

## supporting skills

| skill | fires when | does what |
|---|---|---|
| `$using-git-worktrees` | before implementation | creates isolated workspace on new branch |
| `$test-driven-development` | during implementation | enforces RED-GREEN-REFACTOR cycle |
| `$systematic-debugging` | on any failure | 4-phase root cause investigation |
| `$requesting-code-review` | between tasks | dispatches code-reviewer agent |
| `$receiving-code-review` | on review feedback | evaluates feedback technically, no blind agreement |
| `$verification-before-completion` | before "done" claims | requires fresh evidence from actual commands |
| `$dispatching-parallel-agents` | 2+ independent failures | parallel investigation agents |
| `$using-superpowers` | session start | routes to correct skill |
| `$writing-skills` | creating/editing skills | TDD applied to documentation |
