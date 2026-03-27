#!/usr/bin/env node

// server.ts — HTTP entry point for remote MCP deployment (Railway, etc.)
// Uses StreamableHTTPServerTransport instead of stdio.

import { createServer } from "node:http";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import { handleSnapBack } from "./tools/snap_back.js";
import { handleColdTake } from "./tools/cold_take.js";

function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "snarky-devil",
    version: "1.0.0",
  });

  server.registerTool(
    "snap_back",
    {
      description:
        "Takes a question and an existing answer, returns a snarky counter-take that argues the opposite position.",
      inputSchema: {
        question: z
          .string()
          .describe("The original question that was asked"),
        existingAnswer: z
          .string()
          .describe("The existing answer to argue against"),
      },
    },
    async ({ question, existingAnswer }) => {
      try {
        const result = await handleSnapBack({ question, existingAnswer });
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result) },
          ],
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Something went wrong";
        return {
          content: [
            {
              type: "text" as const,
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
    }
  );

  server.registerTool(
    "cold_take",
    {
      description:
        "Takes a topic and an optional intensity level, returns a standalone contrarian opinion with no prior context needed.",
      inputSchema: {
        topic: z
          .string()
          .describe("The topic to be contrarian about"),
        intensity: z
          .enum(["mild", "spicy", "unhinged"])
          .optional()
          .default("spicy")
          .describe(
            'How unhinged the take should be. Defaults to "spicy".'
          ),
      },
    },
    async ({ topic, intensity }) => {
      try {
        const result = await handleColdTake({ topic, intensity });
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result) },
          ],
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Something went wrong";
        return {
          content: [
            {
              type: "text" as const,
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
    }
  );

  return server;
}

const PORT = parseInt(process.env.PORT || "3000", 10);

// Map of session transports for stateful connections
const transports = new Map<string, StreamableHTTPServerTransport>();

const httpServer = createServer(async (req, res) => {
  // Health check
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", server: "snarky-devil-mcp" }));
    return;
  }

  // MCP endpoint
  if (req.url === "/mcp") {
    // For initialization requests, create a new transport + server
    if (req.method === "POST") {
      const sessionId = req.headers["mcp-session-id"] as string | undefined;

      if (sessionId && transports.has(sessionId)) {
        // Existing session — route to its transport
        const transport = transports.get(sessionId)!;
        await transport.handleRequest(req, res);
        return;
      }

      // New session — create transport + server pair
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => crypto.randomUUID(),
      });

      transport.onclose = () => {
        if (transport.sessionId) {
          transports.delete(transport.sessionId);
        }
      };

      const server = createMcpServer();
      await server.connect(transport);

      // Handle the request (which triggers session creation)
      await transport.handleRequest(req, res);

      // Store the transport by session ID
      if (transport.sessionId) {
        transports.set(transport.sessionId, transport);
      }
      return;
    }

    if (req.method === "GET") {
      const sessionId = req.headers["mcp-session-id"] as string | undefined;
      if (sessionId && transports.has(sessionId)) {
        const transport = transports.get(sessionId)!;
        await transport.handleRequest(req, res);
        return;
      }
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Missing or invalid session ID" }));
      return;
    }

    if (req.method === "DELETE") {
      const sessionId = req.headers["mcp-session-id"] as string | undefined;
      if (sessionId && transports.has(sessionId)) {
        const transport = transports.get(sessionId)!;
        await transport.handleRequest(req, res);
        return;
      }
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Session not found" }));
      return;
    }

    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  // Catch-all
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

httpServer.listen(PORT, () => {
  console.log(`Snarky Devil MCP server listening on port ${PORT}`);
  console.log(`  Health: http://localhost:${PORT}/health`);
  console.log(`  MCP:    http://localhost:${PORT}/mcp`);
});
