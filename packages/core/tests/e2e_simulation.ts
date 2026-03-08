/**
 * E2E Local Validation Script
 * This script imports the tRPC app router and simulates a client
 * hitting the execute and getStatus endpoints.
 */
import { appRouter } from '../src/api/trpc';

async function runE2E() {
    console.log('--- Starting E2E MVP Workflow Simulation ---');

    // Create a server-side caller for the tRPC router (no network needed for local test)
    const caller = appRouter.createCaller({});

    const userId = 'user-e2e-test';
    const jdText = 'We are looking for a Senior Developer with strong Node.js, React, and AWS capabilities.';

    try {
        console.log('\n1. Sending "generate_resume" intent to Orchestrator (Brian -> Conductor)...');

        // Call the execute mutation
        const executeResult = await caller.workflows.execute({
            userId,
            intentString: 'Help me tailor my resume for this job',
            jdText
        });

        console.log('Orchestrator responded:', executeResult);

        if (executeResult.status === 'started' && executeResult.workflowId) {
            const { workflowId } = executeResult;
            console.log(`\n2. Workflow ${workflowId} initiated. Polling status...`);

            // Poll the status
            let isCompleted = false;
            let attempts = 0;

            while (!isCompleted && attempts < 10) {
                attempts++;
                const statusResult = await caller.workflows.getStatus({ workflowId });

                console.log(`[Poll ${attempts}] Status: ${statusResult.status} | Phase: ${statusResult.progress}`);

                if (statusResult.status === 'completed') {
                    isCompleted = true;
                    console.log('\n--- E2E Workflow Completed Successfully! ---');
                    console.log('Final Result Payload:');
                    console.log(JSON.stringify(statusResult.result, null, 2));
                } else {
                    // Wait 1.5 seconds before polling again
                    await new Promise(res => setTimeout(res, 1500));
                }
            }

            if (!isCompleted) {
                console.error('\nE2E Workflow timed out (mock might be taking too long).');
            }
        } else {
            console.error('Failed to start workflow:', executeResult);
        }

    } catch (error) {
        console.error('E2E Test Failed:', error);
    }
}

runE2E();
