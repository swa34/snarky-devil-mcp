// snap_back — reactive tool: takes a question + existing answer, returns a snarky counter-take

import { callSnarkyAPI } from "../claude.js";

export interface SnapBackInput {
  /** The original question that was asked */
  question: string;
  /** The existing answer to argue against */
  existingAnswer: string;
}

export interface SnapBackOutput {
  /** The snarky counter-take */
  snark: string;
  /** How confident the devil's advocate is in this take: "low" | "medium" | "high" */
  confidence: string;
}

/**
 * Takes a question and an existing answer, then returns a snarky counter-take.
 * No intensity modifier here — the existing answer gives the model enough to riff on.
 */
export async function handleSnapBack(
  input: SnapBackInput
): Promise<SnapBackOutput> {
  const userMessage = `Question: ${input.question}\n\nExisting answer someone gave: ${input.existingAnswer}\n\nGive me your snarky counter-take.`;

  // call the API without intensity — snap_back always uses the base prompt
  const result = await callSnarkyAPI(userMessage);

  return {
    snark: result.snark,
    confidence: result.confidence,
  };
}
