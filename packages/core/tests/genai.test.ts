import { describe, it, expect, vi } from 'vitest';
import { ResumeWriterAgent } from '../src/agents/genai/ResumeWriterAgent';
import { ForgeScoreAgent } from '../src/agents/genai/ForgeScoreAgent';

describe('GenAI Agents (Mocked for CI)', () => {
    // Ensure we are using the test fallback mocks
    beforeAll(() => {
        process.env.NODE_ENV = 'test';
    });

    describe('ResumeWriterAgent', () => {
        it('should return consistently structured mock data without throwing', async () => {
            const agent = new ResumeWriterAgent('test-user');
            const rewritten = await agent.rewrite('Mock JD', ['Created a button.']);

            expect(Array.isArray(rewritten)).toBe(true);
            expect(rewritten.length).toBeGreaterThan(0);
            expect(typeof rewritten[0]).toBe('string');
            // Assert it returns the mocked realistic responses
            expect(rewritten[0]).toContain('latency');
        });
    });

    describe('ForgeScoreAgent', () => {
        it('should return a valid ForgeScore schema matching the Zod objects', async () => {
            const agent = new ForgeScoreAgent('test-user');
            const scoreData = await agent.scoreResume('Mock JD', 'Mock Resume');

            expect(scoreData.overallScore).toBe(82);
            expect(scoreData.dimensions).toHaveProperty('skillsMatch');
            expect(scoreData.dimensions).toHaveProperty('leadership');
            expect(Array.isArray(scoreData.gapAnalysis)).toBe(true);
        });
    });
});
