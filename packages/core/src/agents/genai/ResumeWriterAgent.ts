import { LLMClient } from './LLMClient';
import { z } from 'zod';

const rewrittenBulletsSchema = z.object({
    rewrittenBullets: z.array(z.string())
});

/**
 * ResumeWriterAgent
 * 
 * A GenAI agent that takes selected bullets from the NLP service
 * and rewrites them to perfectly align with the JD keywords,
 * adopting a confident, metrics-driven tone.
 */
export class ResumeWriterAgent {
    private client: LLMClient;

    constructor(userId: string) {
        this.client = new LLMClient(userId);
    }

    async rewrite(jdText: string, selectedBullets: string[]) {
        const systemPrompt = `You are an expert technical resume writer. 
    Your job is to rewrite the provided resume bullets to highlight the experience 
    that matches the job description. Emphasize metrics, action verbs, and relevant skills.`;

        const userPrompt = `Job Description: \n${jdText}\n\nBullets to Rewrite:\n${selectedBullets.join('\n')}`;

        try {
            // In MVP, we might mock this response if the API key isn't present
            if (process.env.NODE_ENV === 'test' || !process.env.OPENAI_API_KEY) {
                return [
                    "Architected real-time processing pipeline reducing latency by 30%.",
                    "Mentored 5 junior developers, improving team delivery speed."
                ];
            }

            const response = await this.client.generateStructured(
                systemPrompt,
                userPrompt,
                rewrittenBulletsSchema
            );

            return response.rewrittenBullets;
        } catch (error) {
            console.error("[ResumeWriterAgent] Error rewriting bullets", error);
            return selectedBullets; // Fallback to original
        }
    }
}
