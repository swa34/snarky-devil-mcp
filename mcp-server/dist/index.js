#!/usr/bin/env node
// index.ts — MCP server entry point for snarky-devil.
// Registers snap_back and cold_take tools, connects via stdio.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { handleSnapBack } from "./tools/snap_back.js";
import { handleColdTake } from "./tools/cold_take.js";
const server = new McpServer({
    name: "snarky-devil",
    version: "1.0.0",
});
// --- snap_back tool ---
// Takes a question + existing answer, returns a snarky counter-take
server.registerTool("snap_back", {
    description: "Takes a question and an existing answer, returns a snarky counter-take that argues the opposite position.",
    inputSchema: {
        question: z
            .string()
            .describe("The original question that was asked"),
        existingAnswer: z
            .string()
            .describe("The existing answer to argue against"),
    },
}, async ({ question, existingAnswer }) => {
    try {
        const result = await handleSnapBack({ question, existingAnswer });
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result),
                },
            ],
        };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Something went wrong";
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        error: message,
                        snark: "Even the devil's advocate needs a working API key.",
                        confidence: "low",
                    }),
                },
            ],
            isError: true,
        };
    }
});
// --- cold_take tool ---
// Takes a topic + optional intensity, returns a standalone contrarian opinion
server.registerTool("cold_take", {
    description: "Takes a topic and an optional intensity level, returns a standalone contrarian opinion with no prior context needed.",
    inputSchema: {
        topic: z
            .string()
            .describe("The topic to be contrarian about"),
        intensity: z
            .enum(["mild", "spicy", "unhinged"])
            .optional()
            .default("spicy")
            .describe('How unhinged the take should be. Defaults to "spicy".'),
    },
}, async ({ topic, intensity }) => {
    try {
        const result = await handleColdTake({ topic, intensity });
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result),
                },
            ],
        };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Something went wrong";
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        error: message,
                        snark: "The devil's advocate has left the building.",
                        confidence: "low",
                    }),
                },
            ],
            isError: true,
        };
    }
});
// fire it up
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    // server is now listening on stdin/stdout — ready for MCP clients
}
main().catch((error) => {
    console.error("Fatal: MCP server failed to start", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map