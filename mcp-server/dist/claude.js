// claude.ts — talks to the Anthropic API with the snarky system prompt.
// This is the shared caller used by both snap_back and cold_take.
import Anthropic from "@anthropic-ai/sdk";
import { SNARKY_SYSTEM_PROMPT, INTENSITY_MODIFIERS, } from "./prompts/snarky.js";
// lazy-init the client so tests can mock it before any call happens
let client = null;
function getClient() {
    if (!client) {
        // API key comes from process.env.ANTHROPIC_API_KEY — never hardcoded
        client = new Anthropic();
    }
    return client;
}
// exposed for testing — lets you swap in a mock client
export function _setClient(mock) {
    client = mock;
}
export function _resetClient() {
    client = null;
}
/**
 * Call the Anthropic API with a snarky system prompt.
 * If intensity is provided (for cold_take), the matching modifier gets appended.
 * snap_back calls this without intensity — the existing answer gives enough context.
 */
export async function callSnarkyAPI(userMessage, intensity) {
    // build the system prompt — base + optional intensity modifier
    let systemPrompt = SNARKY_SYSTEM_PROMPT;
    if (intensity && INTENSITY_MODIFIERS[intensity]) {
        systemPrompt += INTENSITY_MODIFIERS[intensity];
    }
    // add format instructions so we can parse the response
    const formatInstructions = `\n\nIMPORTANT: You MUST respond in valid JSON with exactly two fields:
- "snark": your snarky response (string)
- "confidence": how much you believe your own take — "low", "medium", or "high"

Respond with ONLY the JSON object, no markdown fences, no extra text.`;
    systemPrompt += formatInstructions;
    const model = process.env.SNARKY_MODEL || "claude-sonnet-4-6";
    const response = await getClient().messages.create({
        model,
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
    });
    // grab the text content from the response
    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
        throw new Error("No text in API response — that's weird");
    }
    const rawText = textBlock.text.trim();
    // try to parse as JSON first (the model usually cooperates)
    try {
        const parsed = JSON.parse(rawText);
        return {
            snark: String(parsed.snark || rawText),
            confidence: validateConfidence(parsed.confidence),
        };
    }
    catch {
        // model went off-script — wrap the raw text as snark with medium confidence
        return {
            snark: rawText,
            confidence: "medium",
        };
    }
}
function validateConfidence(value) {
    if (value === "low" || value === "medium" || value === "high") {
        return value;
    }
    // default to medium if the model returns something unexpected
    return "medium";
}
//# sourceMappingURL=claude.js.map