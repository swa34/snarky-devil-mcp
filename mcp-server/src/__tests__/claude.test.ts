// Tests for claude.ts — the Anthropic API caller
// Mocks the Anthropic client so we don't burn API credits on tests

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { callSnarkyAPI, _setClient, _resetClient } from "../claude.js";
import { SNARKY_SYSTEM_PROMPT, INTENSITY_MODIFIERS } from "../prompts/snarky.js";

// build a mock that quacks like the Anthropic client
function createMockClient(responseText: string) {
  return {
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [{ type: "text", text: responseText }],
      }),
    },
  } as any;
}

describe("callSnarkyAPI", () => {
  afterEach(() => {
    _resetClient();
    vi.restoreAllMocks();
  });

  it("sends the snarky system prompt on every call", async () => {
    const mockClient = createMockClient(
      JSON.stringify({ snark: "test snark", confidence: "medium" })
    );
    _setClient(mockClient);

    await callSnarkyAPI("some question");

    const callArgs = mockClient.messages.create.mock.calls[0][0];
    expect(callArgs.system).toContain(SNARKY_SYSTEM_PROMPT);
  });

  it("does NOT include intensity modifier when intensity is omitted", async () => {
    const mockClient = createMockClient(
      JSON.stringify({ snark: "no intensity", confidence: "low" })
    );
    _setClient(mockClient);

    await callSnarkyAPI("whatever");

    const callArgs = mockClient.messages.create.mock.calls[0][0];
    // should not have any tone adjustment
    expect(callArgs.system).not.toContain("Tone adjustment:");
    // but should still have the format instructions
    expect(callArgs.system).toContain("IMPORTANT: You MUST respond in valid JSON");
  });

  it("appends the mild intensity modifier when intensity is 'mild'", async () => {
    const mockClient = createMockClient(
      JSON.stringify({ snark: "gentle snark", confidence: "low" })
    );
    _setClient(mockClient);

    await callSnarkyAPI("topic", "mild");

    const callArgs = mockClient.messages.create.mock.calls[0][0];
    expect(callArgs.system).toContain(INTENSITY_MODIFIERS["mild"]);
  });

  it("appends the spicy intensity modifier when intensity is 'spicy'", async () => {
    const mockClient = createMockClient(
      JSON.stringify({ snark: "spicy snark", confidence: "high" })
    );
    _setClient(mockClient);

    await callSnarkyAPI("topic", "spicy");

    const callArgs = mockClient.messages.create.mock.calls[0][0];
    expect(callArgs.system).toContain(INTENSITY_MODIFIERS["spicy"]);
  });

  it("appends the unhinged intensity modifier when intensity is 'unhinged'", async () => {
    const mockClient = createMockClient(
      JSON.stringify({ snark: "chaos snark", confidence: "medium" })
    );
    _setClient(mockClient);

    await callSnarkyAPI("topic", "unhinged");

    const callArgs = mockClient.messages.create.mock.calls[0][0];
    expect(callArgs.system).toContain(INTENSITY_MODIFIERS["unhinged"]);
  });

  it("parses valid JSON responses correctly", async () => {
    const mockClient = createMockClient(
      JSON.stringify({ snark: "parsed correctly", confidence: "high" })
    );
    _setClient(mockClient);

    const result = await callSnarkyAPI("test");

    expect(result.snark).toBe("parsed correctly");
    expect(result.confidence).toBe("high");
  });

  it("handles non-JSON responses gracefully (wraps raw text)", async () => {
    const mockClient = createMockClient(
      "This is just raw text, no JSON here buddy"
    );
    _setClient(mockClient);

    const result = await callSnarkyAPI("test");

    expect(result.snark).toBe("This is just raw text, no JSON here buddy");
    expect(result.confidence).toBe("medium"); // default when parsing fails
  });

  it("defaults confidence to 'medium' for invalid confidence values", async () => {
    const mockClient = createMockClient(
      JSON.stringify({ snark: "some snark", confidence: "ultra" })
    );
    _setClient(mockClient);

    const result = await callSnarkyAPI("test");

    expect(result.snark).toBe("some snark");
    expect(result.confidence).toBe("medium"); // "ultra" isn't valid
  });

  it("uses the user message as-is in the API call", async () => {
    const mockClient = createMockClient(
      JSON.stringify({ snark: "ok", confidence: "low" })
    );
    _setClient(mockClient);

    await callSnarkyAPI("my specific question");

    const callArgs = mockClient.messages.create.mock.calls[0][0];
    expect(callArgs.messages[0].content).toBe("my specific question");
  });

  it("uses claude-sonnet-4-6 as default model", async () => {
    const mockClient = createMockClient(
      JSON.stringify({ snark: "ok", confidence: "low" })
    );
    _setClient(mockClient);

    // make sure SNARKY_MODEL isn't set
    const original = process.env.SNARKY_MODEL;
    delete process.env.SNARKY_MODEL;

    await callSnarkyAPI("test");

    const callArgs = mockClient.messages.create.mock.calls[0][0];
    expect(callArgs.model).toBe("claude-sonnet-4-6");

    // restore
    if (original) process.env.SNARKY_MODEL = original;
  });

  it("respects SNARKY_MODEL env var override", async () => {
    const mockClient = createMockClient(
      JSON.stringify({ snark: "ok", confidence: "low" })
    );
    _setClient(mockClient);

    process.env.SNARKY_MODEL = "claude-haiku-4-5";

    await callSnarkyAPI("test");

    const callArgs = mockClient.messages.create.mock.calls[0][0];
    expect(callArgs.model).toBe("claude-haiku-4-5");

    delete process.env.SNARKY_MODEL;
  });

  it("throws when the API response has no text content", async () => {
    const mockClient = {
      messages: {
        create: vi.fn().mockResolvedValue({
          content: [{ type: "image", source: {} }],
        }),
      },
    } as any;
    _setClient(mockClient);

    await expect(callSnarkyAPI("test")).rejects.toThrow(
      "No text in API response"
    );
  });
});
