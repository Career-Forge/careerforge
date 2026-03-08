import { describe, it, expect } from 'vitest';
import { createActor } from 'xstate';
import { conductorMachine } from '../src/orchestration/conductor';

describe('Conductor XState Machine', () => {
    it('should transition from idle to analyzingJD when START_ANALYSIS event is sent', () => {
        const actor = createActor(conductorMachine).start();

        expect(actor.getSnapshot().value).toBe('idle');

        actor.send({ type: 'START_ANALYSIS' });
        expect(actor.getSnapshot().value).toBe('analyzingJD');
    });

    it('should transition to selectingExperiences when ANALYSIS_COMPLETE is received and update context', () => {
        const actor = createActor(conductorMachine).start();
        actor.send({ type: 'START_ANALYSIS' });

        const mockAnalysis = { skills: ['React'], keywords: ['Frontend'] };
        actor.send({ type: 'ANALYSIS_COMPLETE', data: mockAnalysis });

        const snapshot = actor.getSnapshot();
        expect(snapshot.value).toBe('selectingExperiences');
        expect(snapshot.context.jdAnalysis).toEqual(mockAnalysis);
    });

    it('should complete the full basic happy path to finished', () => {
        const actor = createActor(conductorMachine).start();

        actor.send({ type: 'START_ANALYSIS' });
        expect(actor.getSnapshot().value).toBe('analyzingJD');

        actor.send({ type: 'ANALYSIS_COMPLETE', data: {} });
        expect(actor.getSnapshot().value).toBe('selectingExperiences');

        actor.send({ type: 'SELECTION_COMPLETE', data: ['bullet1'] });
        const snapshot2 = actor.getSnapshot();
        expect(snapshot2.value).toBe('writingResume');
        expect(snapshot2.context.selectedBullets).toEqual(['bullet1']);

        actor.send({ type: 'WRITING_COMPLETE', data: ['rewritten_bullet1'] });
        const finalSnapshot = actor.getSnapshot();
        expect(finalSnapshot.value).toBe('finished');
        expect(finalSnapshot.context.rewrittenBullets).toEqual(['rewritten_bullet1']);
    });

    it('should transition to failed state on ERROR event', () => {
        const actor = createActor(conductorMachine).start();
        actor.send({ type: 'START_ANALYSIS' });

        actor.send({ type: 'ERROR', message: 'Failed to connect to NLP service' });
        const snapshot = actor.getSnapshot();

        expect(snapshot.value).toBe('failed');
        expect(snapshot.context.error).toBe('Failed to connect to NLP service');
    });
});
