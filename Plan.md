# Snarky Devil's Advocate MCP — Build Plan

> A novelty MCP server that calls the Anthropic API to generate snarky, contrarian counter-takes on any topic or answer.  
> Built with Claude Code using parallel Agent Teams + focused Subagents.

---

## Why This Approach

Based on the Claude Code docs:

- **Subagents** → isolated, focused workers that report back to the lead. No cross-talk. Best for well-scoped, bounded tasks (write the README, generate the test suite, scaffold a file structure).
- **Agent Teams** → teammates share a task list, message each other directly, and can challenge/coordinate mid-flight. Best when two workstreams need to stay in sync (e.g., the website needs to know the exact tool names and schema the MCP engineer just committed to).

**Decision for this project:**

- Phase 2 uses an **Agent Team** (MCP Engineer ↔ Web Engineer) because the website documents the MCP's tool names, parameters, and example outputs — if those change mid-build, the web agent needs to know without the lead re-relaying everything.
- Each teammate uses **Subagents** for bounded side tasks (tests, README, copy polish) where no cross-talk is needed.

---

## Project Structure

```
snarky-devil-mcp/
├── mcp-server/
│   ├── src/
│   │   ├── index.ts          # MCP server entry, tool registration
│   │   ├── tools/
│   │   │   ├── snap_back.ts  # Reactive tool: takes question + existing answer
│   │   │   └── cold_take.ts  # Standalone tool: topic only, no prior answer
│   │   └── claude.ts         # Anthropic API call + snarky system prompt logic
│   ├── .claude/agents/
│   │   ├── test-writer.md    # Subagent definition: writes Vitest tests
│   │   └── doc-writer.md     # Subagent definition: writes README + JSDoc
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── website/
│   ├── index.html
│   ├── style.css
│   ├── app.js               # Live demo widget (calls MCP-style prompts)
│   └── assets/
│       └── logo.svg
├── CLAUDE.md                # Shared project context for all agents
└── PLAN.md                  # This file
```

---

## Phase 0 — Pre-Flight (Human, ~10 min)

Do this yourself before running Claude Code:

1. Create the repo: `mkdir snarky-devil-mcp && cd snarky-devil-mcp && git init`
2. Enable Agent Teams:
   ```bash
   export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
   ```
   Or add to `~/.claude/settings.json`:
   ```json
   { "env": { "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1" } }
   ```
3. Create `CLAUDE.md` at the repo root with the content in Appendix A below.
4. Have your `ANTHROPIC_API_KEY` in your environment.

---

## Phase 1 — Architecture & Contract Definition (Single Session)

**Run this yourself in a single Claude Code session. This is sequential by design — you need a locked contract before parallel work starts.**

### Prompt to run:

```
You are the architect for a Node.js MCP server called "snarky-devil-mcp".

Your job in this session is ONLY to:
1. Scaffold the full directory structure listed in PLAN.md
2. Write the tool contracts (TypeScript interfaces) for two tools:
   - snap_back: accepts { question: string, existingAnswer: string }, returns { snark: string, confidence: string }
   - cold_take: accepts { topic: string, intensity?: "mild" | "spicy" | "unhinged" }, returns { snark: string, confidence: string }
3. Write the snarky system prompt that will be used in claude.ts (save it as src/prompts/snarky.ts)
4. Write CLAUDE.md content for each subdirectory (mcp-server/CLAUDE.md and website/CLAUDE.md)
5. Write a CONTRACT.md at the repo root documenting tool names, parameter schemas, and example inputs/outputs

Do NOT write any implementation logic yet. Focus only on structure and contracts.
After completing, confirm the contract is locked and list every file you created.
```

**Expected outputs from Phase 1:**

- `src/tools/snap_back.ts` — interface + stub only
- `src/tools/cold_take.ts` — interface + stub only
- `src/prompts/snarky.ts` — the system prompt string
- `CONTRACT.md` — locked API contract
- `mcp-server/CLAUDE.md` — MCP-specific agent context
- `website/CLAUDE.md` — website-specific agent context
- All directories created

**Do not proceed to Phase 2 until you have reviewed and approved CONTRACT.md.**

---

## Phase 2 — Parallel Build (Agent Team)

**This is the main build phase. Spin up an Agent Team with two teammates.**

### Enable Agent Teams and paste this into Claude Code:

```
I need an agent team to build two independent workstreams in parallel.
Please create an agent team with the following roles:

TEAM LEAD: You coordinate both teammates. Your job is to:
- Assign tasks from the shared task list below
- Watch for schema drift (if MCP Engineer changes a tool name or param, alert Web Engineer)
- Merge and review both workstreams at the end
- Do not write implementation code yourself

TEAMMATE 1 — MCP Engineer:
- Working directory: mcp-server/
- Read CONTRACT.md and mcp-server/CLAUDE.md before starting
- Implement src/index.ts: set up the MCP server using @modelcontextprotocol/sdk, register both tools
- Implement src/claude.ts: call the Anthropic API using the snarky system prompt from src/prompts/snarky.ts, pass question+existingAnswer context for snap_back or just topic for cold_take
- Implement src/tools/snap_back.ts: full handler logic
- Implement src/tools/cold_take.ts: full handler logic including intensity levels that adjust the system prompt temperature/tone
- Use TypeScript, target Node 18+
- When implementation is done, message the Web Engineer with: final tool names, exact parameter schemas, and two real example outputs (run the tools in dry-run mode if possible)
- Then spawn a subagent (test-writer) to write the test suite — DO NOT write tests yourself

TEAMMATE 2 — Web Engineer:
- Working directory: website/
- Read CONTRACT.md and website/CLAUDE.md before starting
- Build a single-page info site in plain HTML/CSS/JS (no framework)
- Page sections: Hero (name + tagline), What It Does, Tools Reference (snap_back and cold_take with params), Install Instructions, Live Demo widget, Footer
- Use a dark theme with a slightly chaotic/snarky visual personality — think terminal green on near-black with bold accent colors
- WAIT for the MCP Engineer's message with final tool schemas before filling in the Tools Reference section
- The Live Demo widget should call a mock JS function locally (not a real API call) that returns a hardcoded snarky response — just to show interactivity
- When the page structure is done but before final polish, spawn a subagent (copy-writer) to punch up the copy with personality
- After receiving polished copy, finalize the page

SHARED TASK LIST:
[ ] MCP: Implement index.ts
[ ] MCP: Implement claude.ts
[ ] MCP: Implement snap_back.ts
[ ] MCP: Implement cold_take.ts
[ ] MCP: Message Web Engineer with final schemas
[ ] MCP: Spawn test-writer subagent
[ ] WEB: Build page structure
[ ] WEB: Wait for schema message, fill Tools Reference
[ ] WEB: Spawn copy-writer subagent
[ ] WEB: Finalize page
[ ] LEAD: Review both outputs against CONTRACT.md
[ ] LEAD: Final integration check
```

---

## Phase 2 Subagent Definitions

These live as markdown files in `.claude/agents/` so Claude Code picks them up automatically.

### `mcp-server/.claude/agents/test-writer.md`

```markdown
---
name: test-writer
description: >
  Use this agent when MCP implementation is complete and tests need to be written.
  Writes Vitest unit tests for all MCP tools. Has read access to src/ and write
  access to src/__tests__/. Does not modify implementation files.
tools: [Read, Write, Bash]
---

You are a focused test-writing agent for a TypeScript MCP server.

Your ONLY job is to write a Vitest test suite covering:

1. snap_back tool: happy path, missing existingAnswer fallback, empty question edge case
2. cold_take tool: all three intensity levels (mild, spicy, unhinged), missing intensity defaults to "spicy"
3. claude.ts: mock the Anthropic API call and verify the snarky system prompt is always included

Write tests to: src/**tests**/snap_back.test.ts, src/**tests**/cold_take.test.ts
Mock the Anthropic client using vitest's vi.mock().
Do not modify any src/ files outside **tests**/.
When done, run `npm test` and report results.
```

### `mcp-server/.claude/agents/doc-writer.md`

```markdown
---
name: doc-writer
description: >
  Use this agent after all implementation is complete to write the README and
  inline JSDoc comments. Read-only access to src/. Write access to README.md only.
tools: [Read, Write]
---

You are a documentation agent. Your ONLY job:

1. Read all files in src/ to understand what the tools do
2. Write README.md covering: what it is, installation, Claude Desktop config snippet, tool reference (snap_back and cold_take with params and example outputs), contributing
3. Add JSDoc comments to the top of each tool file if they are missing

Write with Scott's voice: casual, direct, no corporate fluff.
Do not modify any implementation files.
```

### `website/.claude/agents/copy-writer.md`

```markdown
---
name: copy-writer
description: >
  Use this agent when the website HTML structure is complete but copy needs personality.
  Rewrites all user-facing text in the HTML to be funnier and snarkier without
  changing any HTML structure, CSS classes, or JS logic.
tools: [Read, Write]
---

You are a copy editor who specializes in making developer tools sound fun and a little
obnoxious (in a good way). Your ONLY job:

1. Read index.html
2. Rewrite all user-facing text (headings, paragraphs, button labels, tooltips)
   to match the snarky theme of the tool itself
3. Tagline must be punchy and under 10 words
4. Do not touch any HTML structure, CSS classes, IDs, or JavaScript
5. Write the updated index.html back to disk
```

---

## Phase 3 — Integration & QA (Single Session)

After Phase 2 completes, run a final single session:

```
All implementation is complete. Do the following in order:

1. Run `npm run build` in mcp-server/ and fix any TypeScript errors
2. Run `npm test` in mcp-server/ and fix any failing tests
3. Validate that the MCP server starts cleanly: `node dist/index.js`
4. Open website/index.html in a browser preview (use a local server if needed)
   and verify all sections render correctly
5. Check that every tool name and parameter in website/index.html matches
   the tool names in mcp-server/src/tools/
6. If any mismatches are found, fix website/index.html to match the implementation
7. Write a CHANGELOG.md with a summary of what was built
8. Create a claude_desktop_config.json snippet showing how to add this MCP to Claude Desktop

Report pass/fail for each step.
```

---

## Phase 4 — Polish (Optional Subagents, Parallel)

If you want to run optional polish passes after QA, spawn these as parallel subagents (no inter-agent communication needed, so subagents are the right call here):

```
Spawn three parallel subagents:

SUBAGENT A — security-check:
  Read all files in mcp-server/src/. Check for: hardcoded API keys, unsafe eval,
  unvalidated user input passed directly to the Anthropic API. Report findings only,
  do not modify files.

SUBAGENT B — readme-polish:
  Read mcp-server/README.md. Check for: broken markdown, missing code fences,
  unclear install steps. Rewrite any unclear sections. Write back to README.md.

SUBAGENT C — lighthouse-check:
  Read website/index.html and website/style.css. Check for: missing alt tags,
  poor contrast ratios (eyeball check), missing meta description, missing viewport
  meta tag. Fix any issues found. Report what you changed.
```

---

## Appendix A — Root CLAUDE.md Content

Create this file at the repo root before starting Phase 1:

```markdown
# snarky-devil-mcp

## What This Is

A novelty MCP server with two tools:

- snap_back: takes a question + an existing answer and returns a snarky counter-take
- cold_take: takes a topic and returns a standalone contrarian opinion with no context

Both tools call the Anthropic API internally with a snarky system prompt.

## Stack

- Check the npm registry for the latest on all libraries and dependencies, but plan for:
- MCP server: Node.js 25+, TypeScript, @modelcontextprotocol/sdk
- API: Anthropic SDK latest check teh npm registry(claude-sonnet-4-6 model, or configurable)
- Tests: Vitest
- Website: Plain HTML/CSS/JS, no framework

## Voice & Tone

- Code comments: casual, direct, no "enterprise" language
- README: written like a dev talking to another dev
- Website copy: snarky, a little obnoxious, fun — matches the tool's personality

## Key Constraints

- The Anthropic API key must come from process.env.ANTHROPIC_API_KEY — never hardcoded
- Tool parameter schemas are locked in CONTRACT.md — do not change names or shapes without updating CONTRACT.md first and alerting all agents
- MCP server must work with Claude Desktop and Claude Code MCP config

## File Ownership (for Agent Teams)

- mcp-server/: owned by MCP Engineer teammate
- website/: owned by Web Engineer teammate
- CONTRACT.md: read by all, written only by architect (Phase 1)
```

---

## Estimated Token Budget

| Phase                    | Mode                            | Est. Cost                  |
| ------------------------ | ------------------------------- | -------------------------- |
| Phase 1 – Scaffold       | Single session                  | Low                        |
| Phase 2 – Parallel build | Agent Team (2 teammates + lead) | Medium-High (~3-4x single) |
| Phase 2 – Subagents      | 3 subagents total               | Low                        |
| Phase 3 – QA             | Single session                  | Low                        |
| Phase 4 – Polish         | 3 parallel subagents            | Low                        |

Agent Teams cost roughly 3-4x a single session for the same work — worth it here because the website ↔ MCP schema sync is real coordination, not just reporting.

---

## Quick Reference: When Each Pattern Is Used

| Task                           | Pattern                    | Reason                                                       |
| ------------------------------ | -------------------------- | ------------------------------------------------------------ |
| Scaffold + contract            | Single session             | Sequential, must complete before anything else               |
| MCP build + Website build      | **Agent Team**             | Website needs live schema updates from MCP Engineer mid-task |
| Write tests                    | **Subagent** (test-writer) | Isolated, bounded, no cross-talk needed                      |
| Write docs                     | **Subagent** (doc-writer)  | Isolated, read-only to src                                   |
| Polish copy                    | **Subagent** (copy-writer) | Isolated, bounded                                            |
| QA / integration               | Single session             | Sequential, needs full picture                               |
| Security + README + Lighthouse | **Parallel subagents**     | Three independent checks, no coordination                    |
