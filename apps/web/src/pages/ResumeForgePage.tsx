import React, { useState, useEffect } from 'react';

// For the MVP, we mock the trpc hook import that would be generated
// import { trpc } from '../utils/trpc';
const trpc = {
    workflows: {
        execute: {
            useMutation: () => ({
                mutateAsync: async (input: any) => ({ workflowId: `wf-${Date.now()}` }),
                isLoading: false
            })
        },
        getStatus: {
            useQuery: (input: { workflowId: string }, options: any) => {
                // Mocking polling state changes for MVP
                const [state, setState] = useState({ status: 'running', progress: 'analyzingJD' });

                useEffect(() => {
                    if (!options.enabled) return;
                    const timers = [
                        setTimeout(() => setState({ status: 'running', progress: 'selectingExperiences' }), 1000),
                        setTimeout(() => setState({ status: 'running', progress: 'writingResume' }), 3000),
                        setTimeout(() => setState({
                            status: 'completed',
                            progress: 'finished',
                            result: { forgeScore: 88, rewrittenBullets: ['Led a global expansion...', 'Enhanced performance...'] }
                        }), 5000)
                    ];
                    return () => timers.forEach(clearTimeout);
                }, [options.enabled]);

                return { data: state };
            }
        }
    }
};

export const ResumeForgePage: React.FC = () => {
    const [jdText, setJdText] = useState('');
    const [workflowId, setWorkflowId] = useState<string | null>(null);

    const executeMutation = trpc.workflows.execute.useMutation();

    const { data: statusData } = trpc.workflows.getStatus.useQuery(
        { workflowId: workflowId! },
        { enabled: !!workflowId && workflowId !== '', refetchInterval: 1000 }
    );

    const handleGenerate = async () => {
        if (!jdText.trim()) return;
        try {
            const result = await executeMutation.mutateAsync({
                userId: 'user-123',
                intentString: 'match resume to job description',
                jdText,
            });
            setWorkflowId(result.workflowId);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto font-sans">
            <h1 className="text-3xl font-bold mb-6">CareerForge Resume Matching</h1>

            <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Job Description</label>
                <textarea
                    className="w-full h-48 p-4 border rounded-md"
                    placeholder="Paste Job Description here..."
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                />
            </div>

            <button
                onClick={handleGenerate}
                disabled={executeMutation.isLoading || statusData?.status === 'running'}
                className="px-6 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400"
            >
                {executeMutation.isLoading ? 'Starting...' : 'Forge Resume'}
            </button>

            {/* Workflow Status Tracker */}
            {workflowId && statusData && (
                <div className="mt-8 p-6 border rounded-lg bg-gray-50">
                    <h2 className="text-xl font-semibold mb-4">Workflow Status</h2>

                    <div className="flex flex-col space-y-2">
                        <div>Status: <span className="font-mono">{statusData.status}</span></div>
                        <div>Phase: <span className="font-mono">{statusData.progress}</span></div>
                    </div>

                    {statusData.status === 'completed' && statusData.result && (
                        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
                            <h3 className="text-lg font-bold text-green-800">Success! ForgeScore: {statusData.result.forgeScore}</h3>
                            <div className="mt-4">
                                <h4 className="font-semibold mb-2">Rewritten Bullets:</h4>
                                <ul className="list-disc pl-5 space-y-2">
                                    {statusData.result.rewrittenBullets.map((bullet: string, i: number) => (
                                        <li key={i}>{bullet}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ResumeForgePage;
