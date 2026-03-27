// cold_take — standalone tool: takes a topic and optional intensity, returns a contrarian opinion
import { callSnarkyAPI } from "../claude.js";
/**
 * Takes a topic and returns a standalone contrarian opinion.
 * Intensity defaults to "spicy" because why wouldn't it.
 */
export async function handleColdTake(input) {
    const intensity = input.intensity ?? "spicy";
    const userMessage = `Topic: ${input.topic}\n\nGive me your hottest contrarian take.`;
    // cold_take uses intensity to dial the snark level
    const result = await callSnarkyAPI(userMessage, intensity);
    return {
        snark: result.snark,
        confidence: result.confidence,
    };
}
//# sourceMappingURL=cold_take.js.map