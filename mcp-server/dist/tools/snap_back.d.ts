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
export declare function handleSnapBack(input: SnapBackInput): Promise<SnapBackOutput>;
//# sourceMappingURL=snap_back.d.ts.map