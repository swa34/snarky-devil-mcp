# CONTRACT.md — Snarky Devil MCP Tool Contract

> **Status: LOCKED**
> Do not change tool names, parameter names, or response shapes without updating this file first and alerting all agents.

---

## Tool: `snap_back`

**Description:** Takes a question and an existing answer, returns a snarky counter-take that argues the opposite position.

### Input Schema

| Parameter        | Type     | Required | Description                          |
| ---------------- | -------- | -------- | ------------------------------------ |
| `question`       | `string` | Yes      | The original question that was asked |
| `existingAnswer` | `string` | Yes      | The existing answer to argue against |

### Output Schema

| Field        | Type     | Description                                                      |
| ------------ | -------- | ---------------------------------------------------------------- |
| `snark`      | `string` | The snarky counter-take                                          |
| `confidence` | `string` | Self-assessed confidence: `"low"`, `"medium"`, or `"high"` |

### Example

**Input:**
```json
{
  "question": "Should I use TypeScript for my next project?",
  "existingAnswer": "Yes, TypeScript catches bugs at compile time and improves developer experience."
}
```

**Output:**
```json
{
  "snark": "Ah yes, TypeScript — because what every project needs is twice the boilerplate and a config file that requires its own config file. You know what else catches bugs? Reading your code. Revolutionary concept, I know.",
  "confidence": "low"
}
```

---

## Tool: `cold_take`

**Description:** Takes a topic and an optional intensity level, returns a standalone contrarian opinion with no prior context needed.

### Input Schema

| Parameter   | Type                                       | Required | Default    | Description                          |
| ----------- | ------------------------------------------ | -------- | ---------- | ------------------------------------ |
| `topic`     | `string`                                   | Yes      | —          | The topic to be contrarian about     |
| `intensity` | `"mild"` \| `"spicy"` \| `"unhinged"` | No       | `"spicy"` | How unhinged the take should be      |

### Output Schema

| Field        | Type     | Description                                                      |
| ------------ | -------- | ---------------------------------------------------------------- |
| `snark`      | `string` | The contrarian hot take                                          |
| `confidence` | `string` | Self-assessed confidence: `"low"`, `"medium"`, or `"high"` |

### Example (intensity: "spicy")

**Input:**
```json
{
  "topic": "microservices",
  "intensity": "spicy"
}
```

**Output:**
```json
{
  "snark": "Microservices: because your monolith was too easy to debug and you missed the thrill of tracing a request through 47 services just to find out someone misspelled an environment variable.",
  "confidence": "high"
}
```

### Example (intensity: "unhinged")

**Input:**
```json
{
  "topic": "AI replacing developers",
  "intensity": "unhinged"
}
```

**Output:**
```json
{
  "snark": "AI won't replace developers. Developers will replace developers — by mass-adopting AI tools that generate code none of them understand, creating a glorious tower of Babel made of auto-completed spaghetti. We're not being replaced, we're being promoted to bug archaeologists.",
  "confidence": "medium"
}
```

---

## MCP Registration

Both tools are registered on a single MCP server. The server name is `snarky-devil`.

### Claude Desktop Config Snippet

```json
{
  "mcpServers": {
    "snarky-devil": {
      "command": "node",
      "args": ["/path/to/snarky-devil-mcp/mcp-server/dist/index.js"],
      "env": {
        "ANTHROPIC_API_KEY": "your-key-here"
      }
    }
  }
}
```

### Claude Code Config

```bash
claude mcp add snarky-devil -- node /path/to/snarky-devil-mcp/mcp-server/dist/index.js
```

---

## Notes

- The Anthropic API key **must** come from `process.env.ANTHROPIC_API_KEY` — never hardcoded.
- The snarky system prompt lives in `mcp-server/src/prompts/snarky.ts` and is shared by both tools.
- `cold_take` intensity defaults to `"spicy"` when omitted.
- `confidence` values are always one of: `"low"`, `"medium"`, `"high"`.
