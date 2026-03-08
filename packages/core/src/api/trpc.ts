import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { brian } from '../orchestration/brian';
import { memoryVault } from '../state/MemoryVaultAgent';

const t = initTRPC.create();
export const router = t.router;
export const publicProcedure = t.procedure;

// Mock in-memory store to simulate workflow state (since we aren't running MongoDB yet)
const mockWorkflowStore = new Map<string, any>();

export const appRouter = router({
    workflows: router({
        execute: publicProcedure
            .input(
                z.object({
                    userId: z.string(),
                    intentString: z.string(),
                    jdText: z.string(),
                })
            )
            .mutation(async ({ input }) => {
                // 1. Brian routes intent
                const intent = brian.route(input.intentString);

                if (intent !== 'generate_resume') {
                    return { status: 'error', message: 'Unsupported intent' };
                }

                // 2. Setup workflow in DB
                const workflow = await memoryVault.createWorkflow(input.userId, intent, {
                    jdText: input.jdText
                });

                // MVP Simulation: we mock the asynchronous workflow execution
                // which would otherwise be driven by the conductor and the agent registry.
                mockWorkflowStore.set(workflow._id, {
                    status: 'running',
                    progress: 'analyzingJD'
                });

                // Background simulation for MVP UI testing:
                setTimeout(() => {
                    mockWorkflowStore.set(workflow._id, { status: 'running', progress: 'selectingExperiences' });
                    setTimeout(() => {
                        mockWorkflowStore.set(workflow._id, { status: 'running', progress: 'writingResume' });
                        setTimeout(() => {
                            mockWorkflowStore.set(workflow._id, {
                                status: 'completed',
                                progress: 'finished',
                                result: {
                                    forgeScore: 85,
                                    rewrittenBullets: [
                                        "Engineered a scalable microservice architecture handling 1M+ req/day.",
                                        "Optimized critical paths reducing latency by 40%."
                                    ]
                                }
                            });
                        }, 5000);
                    }, 3000);
                }, 1500);

                return {
                    workflowId: workflow._id,
                    status: 'started'
                };
            }),

        getStatus: publicProcedure
            .input(
                z.object({
                    workflowId: z.string()
                })
            )
            .query(({ input }) => {
                const state = mockWorkflowStore.get(input.workflowId);
                if (!state) {
                    return { status: 'not_found' };
                }
                return state;
            })
    })
});

export type AppRouter = typeof appRouter;
