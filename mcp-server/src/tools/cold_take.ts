// cold_take — standalone tool: takes a topic and optional intensity, returns a contrarian opinion

import { callSnarkyAPI } from "../claude.js";

export type Intensity = "mild" | "spicy" | "unhinged";

export interface ColdTakeInput {
  /** The topic to generate a contrarian opinion about */
  topic: string;
  /** How unhinged the take should be. Defaults to "spicy" if omitted. */
  intensity?: Intensity;
}

export interface ColdTakeOutput {
  /** The contrarian hot take */
  snark: string;
  /** How confident the devil's advocate is in this take: "low" | "medium" | "high" */
  confidence: string;
}

/**
 * Takes a topic and returns a standalone contrarian opinion.
 * Intensity defaults to "spicy" because why wouldn't it.
 */
export async function handleColdTake(
  input: ColdTakeInput
): Promise<ColdTakeOutput> {
  const intensity: Intensity = input.intensity ?? "spicy";
  const userMessage = `Topic: ${input.topic}\n\nGive me your hottest contrarian take.`;

  // cold_take uses intensity to dial the snark level
  const result = await callSnarkyAPI(userMessage, intensity);

  return {
    snark: result.snark,
    confidence: result.confidence,
  };
}
