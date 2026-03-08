/**
 * Brian (The Router)
 * 
 * Analyzes the user's intent and routes them to the appropriate Conductor workflow.
 * For MVP, we use naive deterministic regex/keyword matching to route to the
 * `generate_resume` intent.
 */
export class BrianRouter {
    public route(input: string): string {
        const lowercaseInput = input.toLowerCase();

        // MVP basic heuristic
        if (
            lowercaseInput.includes('resume') ||
            lowercaseInput.includes('tailor') ||
            lowercaseInput.includes('job description') ||
            lowercaseInput.includes('match')
        ) {
            return 'generate_resume';
        }

        // Default or unknown intent
        return 'unknown';
    }
}

export const brian = new BrianRouter();
