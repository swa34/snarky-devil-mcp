// snap_back — reactive tool: takes a question + existing answer, returns a snarky counter-take
import { callSnarkyAPI } from "../claude.js";
/**
 * Takes a question and an existing answer, then returns a snarky counter-take.
 * No intensity modifier here — the existing answer gives the model enough to riff on.
 */
export async function handleSnapBack(input) {
    const userMessage = `Question: ${input.question}\n\nExisting answer someone gave: ${input.existingAnswer}\n\nGive me your snarky counter-take.`;
    // call the API without intensity — snap_back always uses the base prompt
    const result = await callSnarkyAPI(userMessage);
    return {
        snark: result.snark,
        confidence: result.confidence,
    };
}
//# sourceMappingURL=snap_back.js.map