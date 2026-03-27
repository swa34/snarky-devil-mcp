import Anthropic from "@anthropic-ai/sdk";
import type { Intensity } from "./tools/cold_take.js";
type Confidence = "low" | "medium" | "high";
export interface SnarkyResponse {
    snark: string;
    confidence: Confidence;
}
export declare function _setClient(mock: Anthropic): void;
export declare function _resetClient(): void;
/**
 * Call the Anthropic API with a snarky system prompt.
 * If intensity is provided (for cold_take), the matching modifier gets appended.
 * snap_back calls this without intensity — the existing answer gives enough context.
 */
export declare function callSnarkyAPI(userMessage: string, intensity?: Intensity): Promise<SnarkyResponse>;
export {};
//# sourceMappingURL=claude.d.ts.map