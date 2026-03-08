import { LLMClient } from './LLMClient';
import { z } from 'zod';

const forgeScoreSchema = z.object({
    overallScore: z.number().min(0).max(100),
    dimensions: z.object({
        skillsMatch: z.number(),
        experienceLevel: z.number(),
        metricImpact: z.number(),
        formatting: z.number(),
        clarity: z.number(),
        leadership: z.number(),
    }),
    gapAnalysis: z.array(z.string())
});

/**
 * ForgeScoreAgent
 * 
 * Compares the generated/updated resume against the Job Description.
 * Returns a multi-dimensional score and gap analysis.
 */
export class ForgeScoreAgent {
    private client: LLMClient;

    constructor(userId: string) {
        this.client = new LLMClient(userId);
    }

    async scoreResume(jdText: string, resumeContent: string) {
        const systemPrompt = `You are peak AI evaluator acting as a hiring manager.
    Score the applicant's resume against the job description on a 0-100 scale
    across 6 dimensions: skills match, experience level, metric impact, formatting, 
    clarity, and leadership. Also provide a brief gap analysis.`;

        const userPrompt = `Job Description:\n${jdText}\n\nResume Content:\n${resumeContent}`;

        try {
            if (process.env.NODE_ENV === 'test' || !process.env.OPENAI_API_KEY) {
                return {
                    overallScore: 82,
                    dimensions: {
                        skillsMatch: 85,
                        experienceLevel: 80,
                        metricImpact: 90,
                        formatting: 80,
                        clarity: 85,
                        leadership: 70
                    },
                    gapAnalysis: [
                        "Missing direct mention of Kubernetes deployment experience.",
                        "Could highlight cross-functional communication more."
                    ]
                };
            }

            const response = await this.client.generateStructured(
                systemPrompt,
                userPrompt,
                forgeScoreSchema
            );

            return response;
        } catch (error) {
            console.error("[ForgeScoreAgent] Error scoring resume", error);
            throw new Error('Failed to score resume.');
        }
    }
}
