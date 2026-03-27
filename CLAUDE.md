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

```
