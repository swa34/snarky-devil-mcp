# website/ — Agent Context

## Ownership

This directory is owned by the **Web Engineer** teammate.

## What Lives Here

- `index.html` — Single-page info site for the snarky-devil MCP
- `style.css` — Dark theme with chaotic/snarky visual personality
- `app.js` — Live demo widget (mock function, not a real API call)
- `assets/logo.svg` — Logo asset

## Page Sections

1. **Hero** — Name + tagline
2. **What It Does** — Brief explainer
3. **Tools Reference** — snap_back and cold_take with params and examples
4. **Install Instructions** — Claude Desktop config snippet + Claude Code CLI command
5. **Live Demo** — Interactive widget with hardcoded snarky responses
6. **Footer**

## Key Rules

- Read `CONTRACT.md` at the repo root for the canonical tool schemas
- **Wait for the MCP Engineer's message** with final tool schemas before filling in the Tools Reference section — do not guess or use stale data
- Plain HTML/CSS/JS only — no frameworks, no build tools
- Dark theme: terminal green on near-black, bold accent colors
- Copy should be snarky and fun — the site's personality matches the tool's personality
- The Live Demo widget calls a local mock JS function that returns hardcoded snarky responses — no real API calls from the browser

## Voice & Tone

- Snarky, a little obnoxious, fun
- Written like a dev who's way too proud of their side project
- No corporate language, no "leverage", no "synergy"
