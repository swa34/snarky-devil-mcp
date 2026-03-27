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
export declare function handleColdTake(input: ColdTakeInput): Promise<ColdTakeOutput>;
//# sourceMappingURL=cold_take.d.ts.map