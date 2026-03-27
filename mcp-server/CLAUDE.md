# mcp-server/ — Agent Context

## Ownership

This directory is owned by the **MCP Engineer** teammate.

## What Lives Here

- `src/index.ts` — MCP server entry point, registers both tools with @modelcontextprotocol/sdk
- `src/tools/snap_back.ts` — Handler for the snap_back tool
- `src/tools/cold_take.ts` — Handler for the cold_take tool
- `src/claude.ts` — Anthropic API caller, injects the snarky system prompt
- `src/prompts/snarky.ts` — The system prompt string + intensity modifiers
- `src/__tests__/` — Vitest test files (written by test-writer subagent)

## Key Rules

- Read `CONTRACT.md` at the repo root before changing any tool name, param, or response shape
- The Anthropic API key comes from `process.env.ANTHROPIC_API_KEY` — never hardcode it
- `cold_take` intensity defaults to `"spicy"` when the param is omitted
- Both tools return `{ snark: string, confidence: string }` — do not add extra fields without updating CONTRACT.md
- After implementation, message the Web Engineer teammate with: final tool names, exact parameter schemas, and two real example outputs

## Stack

- Node.js 25+, TypeScript
- @modelcontextprotocol/sdk (MCP server framework)
- Anthropic SDK (claude-sonnet-4-6 model, or configurable)
- Vitest for tests
