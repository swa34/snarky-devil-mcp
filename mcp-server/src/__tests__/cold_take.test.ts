// Tests for cold_take tool handler

import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleColdTake } from "../tools/cold_take.js";
import * as claude from "../claude.js";

// mock the entire claude module
vi.mock("../claude.js", () => ({
  callSnarkyAPI: vi.fn(),
  _setClient: vi.fn(),
  _resetClient: vi.fn(),
}));

const mockCallSnarkyAPI = vi.mocked(claude.callSnarkyAPI);

describe("handleColdTake", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns snark and confidence from the API", async () => {
    mockCallSnarkyAPI.mockResolvedValue({
      snark: "Microservices are just distributed monoliths with extra steps.",
      confidence: "high",
    });

    const result = await handleColdTake({
      topic: "microservices",
      intensity: "spicy",
    });

    expect(result.snark).toBe(
      "Microservices are just distributed monoliths with extra steps."
    );
    expect(result.confidence).toBe("high");
  });

  it("defaults intensity to 'spicy' when omitted", async () => {
    mockCallSnarkyAPI.mockResolvedValue({
      snark: "default spicy take",
      confidence: "medium",
    });

    await handleColdTake({ topic: "testing" });

    // second arg should be "spicy" (the default)
    expect(mockCallSnarkyAPI).toHaveBeenCalledWith(
      expect.any(String),
      "spicy"
    );
  });

  it("passes 'mild' intensity through to the API", async () => {
    mockCallSnarkyAPI.mockResolvedValue({
      snark: "gentle disagreement",
      confidence: "low",
    });

    await handleColdTake({ topic: "React", intensity: "mild" });

    expect(mockCallSnarkyAPI).toHaveBeenCalledWith(
      expect.any(String),
      "mild"
    );
  });

  it("passes 'spicy' intensity through to the API", async () => {
    mockCallSnarkyAPI.mockResolvedValue({
      snark: "full snark mode",
      confidence: "high",
    });

    await handleColdTake({ topic: "TypeScript", intensity: "spicy" });

    expect(mockCallSnarkyAPI).toHaveBeenCalledWith(
      expect.any(String),
      "spicy"
    );
  });

  it("passes 'unhinged' intensity through to the API", async () => {
    mockCallSnarkyAPI.mockResolvedValue({
      snark: "ABSOLUTE CHAOS",
      confidence: "medium",
    });

    await handleColdTake({ topic: "AI", intensity: "unhinged" });

    expect(mockCallSnarkyAPI).toHaveBeenCalledWith(
      expect.any(String),
      "unhinged"
    );
  });

  it("constructs the user message with the topic", async () => {
    mockCallSnarkyAPI.mockResolvedValue({
      snark: "whatever",
      confidence: "low",
    });

    await handleColdTake({ topic: "blockchain" });

    const userMessage = mockCallSnarkyAPI.mock.calls[0][0];
    expect(userMessage).toContain("Topic: blockchain");
    expect(userMessage).toContain("Give me your hottest contrarian take.");
  });

  it("handles empty topic string", async () => {
    mockCallSnarkyAPI.mockResolvedValue({
      snark: "I can disagree with nothing too.",
      confidence: "low",
    });

    const result = await handleColdTake({ topic: "" });

    expect(result.snark).toBeTruthy();
    const userMessage = mockCallSnarkyAPI.mock.calls[0][0];
    expect(userMessage).toContain("Topic: ");
  });

  it("propagates API errors", async () => {
    mockCallSnarkyAPI.mockRejectedValue(
      new Error("Rate limited, even the devil has limits")
    );

    await expect(
      handleColdTake({ topic: "testing" })
    ).rejects.toThrow("Rate limited");
  });
});
