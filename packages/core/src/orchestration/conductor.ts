import { setup, createMachine, assign } from 'xstate';

/**
 * The Conductor
 * 
 * Orchestrates multi-agent workflows using a Finite State Machine (XState).
 */
export const conductorMachine = setup({
    types: {} as {
        context: {
            userId: string;
            workflowId: string;
            jdText: string;
            masterBullets: string[];
            jdAnalysis: any;
            selectedBullets: string[];
            rewrittenBullets: string[];
            score: number | null;
            error: string | null;
        };
        events:
        | { type: 'START_ANALYSIS' }
        | { type: 'ANALYSIS_COMPLETE'; data: any }
        | { type: 'SELECTION_COMPLETE'; data: string[] }
        | { type: 'WRITING_COMPLETE'; data: string[] }
        | { type: 'SCORING_COMPLETE'; data: number }
        | { type: 'ERROR'; message: string };
    },
    actions: {
        logStateChange: ({ context, event }) => {
            console.log(`[Conductor] Transition triggered by ${event.type} for workflow ${context.workflowId}`);
        }
    }
}).createMachine({
    id: 'resumeWorkflow',
    initial: 'idle',
    context: {
        userId: '',
        workflowId: '',
        jdText: '',
        masterBullets: [],
        jdAnalysis: null,
        selectedBullets: [],
        rewrittenBullets: [],
        score: null,
        error: null
    },
    states: {
        idle: {
            on: {
                START_ANALYSIS: 'analyzingJD'
            }
        },
        analyzingJD: {
            entry: 'logStateChange',
            on: {
                ANALYSIS_COMPLETE: {
                    target: 'selectingExperiences',
                    actions: assign({
                        jdAnalysis: ({ event }) => event.data
                    })
                },
                ERROR: {
                    target: 'failed',
                    actions: assign({ error: ({ event }) => event.message })
                }
            }
        },
        selectingExperiences: {
            entry: 'logStateChange',
            on: {
                SELECTION_COMPLETE: {
                    target: 'writingResume',
                    actions: assign({
                        selectedBullets: ({ event }) => event.data
                    })
                },
                ERROR: {
                    target: 'failed',
                    actions: assign({ error: ({ event }) => event.message })
                }
            }
        },
        writingResume: {
            entry: 'logStateChange',
            on: {
                WRITING_COMPLETE: {
                    target: 'finished', // We could add SCORING step before finished, adjusting for MVP simple path
                    actions: assign({
                        rewrittenBullets: ({ event }) => event.data
                    })
                },
                ERROR: {
                    target: 'failed',
                    actions: assign({ error: ({ event }) => event.message })
                }
            }
        },
        failed: {
            type: 'final'
        },
        finished: {
            type: 'final'
        }
    }
});
