// Tests for snap_back tool handler

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { handleSnapBack } from "../tools/snap_back.js";
import * as claude from "../claude.js";

// mock the entire claude module
vi.mock("../claude.js", () => ({
  callSnarkyAPI: vi.fn(),
  _setClient: vi.fn(),
  _resetClient: vi.fn(),
}));

const mockCallSnarkyAPI = vi.mocked(claude.callSnarkyAPI);

describe("handleSnapBack", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns snark and confidence from the API", async () => {
    mockCallSnarkyAPI.mockResolvedValue({
      snark: "Actually, that's a terrible answer.",
      confidence: "high",
    });

    const result = await handleSnapBack({
      question: "Is water wet?",
      existingAnswer: "Yes, water is wet.",
    });

    expect(result.snark).toBe("Actually, that's a terrible answer.");
    expect(result.confidence).toBe("high");
  });

  it("constructs the user message with question and existing answer", async () => {
    mockCallSnarkyAPI.mockResolvedValue({
      snark: "whatever",
      confidence: "low",
    });

    await handleSnapBack({
      question: "Should I learn Rust?",
      existingAnswer: "Yes, Rust is great for systems programming.",
    });

    const userMessage = mockCallSnarkyAPI.mock.calls[0][0];
    expect(userMessage).toContain("Question: Should I learn Rust?");
    expect(userMessage).toContain(
      "Existing answer someone gave: Yes, Rust is great for systems programming."
    );
    expect(userMessage).toContain("Give me your snarky counter-take.");
  });

  it("calls the API without intensity (snap_back never uses intensity)", async () => {
    mockCallSnarkyAPI.mockResolvedValue({
      snark: "nah",
      confidence: "medium",
    });

    await handleSnapBack({
      question: "test",
      existingAnswer: "test answer",
    });

    // snap_back should only pass the message — no intensity argument
    expect(mockCallSnarkyAPI).toHaveBeenCalledWith(expect.any(String));
  });

  it("handles empty question gracefully", async () => {
    mockCallSnarkyAPI.mockResolvedValue({
      snark: "You didn't even ask anything and I still disagree.",
      confidence: "low",
    });

    const result = await handleSnapBack({
      question: "",
      existingAnswer: "some answer",
    });

    expect(result.snark).toBeTruthy();
    expect(result.confidence).toBe("low");
  });

  it("handles very long inputs without issues", async () => {
    const longQuestion = "Why? ".repeat(500);
    const longAnswer = "Because. ".repeat(500);

    mockCallSnarkyAPI.mockResolvedValue({
      snark: "TL;DR — you're wrong.",
      confidence: "medium",
    });

    const result = await handleSnapBack({
      question: longQuestion,
      existingAnswer: longAnswer,
    });

    expect(result.snark).toBe("TL;DR — you're wrong.");
    // verify the full input was passed through
    const userMessage = mockCallSnarkyAPI.mock.calls[0][0];
    expect(userMessage).toContain(longQuestion.trim());
  });

  it("propagates API errors", async () => {
    mockCallSnarkyAPI.mockRejectedValue(new Error("API is down"));

    await expect(
      handleSnapBack({
        question: "test",
        existingAnswer: "test",
      })
    ).rejects.toThrow("API is down");
  });
});
