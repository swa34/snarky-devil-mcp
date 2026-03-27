# Changelog

## 1.0.0 — 2026-03-26

### MCP Server

- **snap_back tool** — Takes a question + existing answer, returns a snarky counter-take with confidence rating
- **cold_take tool** — Takes a topic + optional intensity (`mild` / `spicy` / `unhinged`), returns a standalone contrarian opinion
- Anthropic API integration via `claude.ts` with a custom snarky system prompt and intensity modifiers
- Both tools return `{ snark, confidence }` — confidence is self-assessed as `low`, `medium`, or `high`
- Full Vitest test suite: 26 tests across 3 files (snap_back, cold_take, claude API caller)
- MCP server entry point registers both tools with `@modelcontextprotocol/sdk` over stdio transport

### Website

- Single-page marketing site: dark theme, terminal-green accents, snarky copy throughout
- Tools Reference section with full parameter tables and example inputs/outputs
- Install instructions with tabbed UI for Claude Desktop (JSON config) and Claude Code (CLI command)
- Interactive demo widget with hardcoded snarky responses (no real API calls from browser)
- Responsive layout, custom fonts (Inter + JetBrains Mono), SVG logo

### Project

- CONTRACT.md defining canonical tool schemas shared across agents
- Agent-team file ownership model (MCP Engineer, Web Engineer, Architect)
