import React from 'react';

export default function ScoringMetricsView() {
    return (
        <main className="flex-1 overflow-auto p-8 font-body leading-relaxed text-primary bg-surface-bright">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h2 className="text-4xl font-headline font-bold text-on-surface">Scoring Engine Metrics</h2>
                    <p className="text-on-surface-variant mt-2 text-lg">Understand exactly how candidate match scores are calculated.</p>
                </div>

                <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/30 p-8">
                    <h3 className="text-2xl font-bold text-on-surface mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-3xl">functions</span>
                        The Core Formula
                    </h3>
                    <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/20 flex flex-col items-center justify-center text-center">
                        <p className="text-lg text-on-surface-variant mb-2">Final Match Score</p>
                        <div className="flex items-center gap-4 text-2xl font-mono font-bold text-primary">
                            <span className="px-4 py-2 bg-primary/10 rounded-lg">Jaccard Similarity</span>
                            <span className="text-on-surface-variant">×</span>
                            <span className="px-4 py-2 bg-tertiary/10 text-tertiary rounded-lg">Education Multiplier</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/30 p-8">
                        <h3 className="text-xl font-bold text-on-surface mb-2 text-primary">1. Skills Matching (Jaccard Similarity)</h3>
                        <p className="text-on-surface-variant mb-6">
                            We use the Jaccard Similarity coefficient to measure how closely a candidate's skills match the job requirements. It evaluates the overlap between two sets of skills:
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/20">
                                <h4 className="font-bold text-sm uppercase tracking-wider text-on-surface-variant mb-2">The Calculation</h4>
                                <div className="text-center font-mono font-bold space-y-2 mb-4 text-sm">
                                    <div className="border-b-2 border-outline-variant/50 pb-2 inline-block px-4 text-on-surface">Intersection (Shared Skills)</div>
                                    <div className="pt-2 text-on-surface">Union (Total Unique Skills)</div>
                                </div>
                                <p className="text-sm text-on-surface-variant">
                                    This ensures candidates aren't just rewarded for listing hundreds of irrelevant skills, as irrelevant skills increase the Union, driving the score down.
                                </p>
                            </div>
                            
                            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/20 flex flex-col justify-center">
                                <h4 className="font-bold text-sm uppercase tracking-wider text-on-surface-variant mb-4">Example Scenario</h4>
                                <ul className="space-y-2 text-sm text-on-surface-variant">
                                    <li><strong className="text-on-surface">Job requires:</strong> Python, AWS, Docker</li>
                                    <li><strong className="text-on-surface">Candidate has:</strong> Python, AWS, Java</li>
                                    <li className="mt-2 pt-2 border-t border-outline-variant/30">
                                        <strong>Intersection:</strong> Python, AWS (2)
                                    </li>
                                    <li>
                                        <strong>Union:</strong> Python, AWS, Docker, Java (4)
                                    </li>
                                    <li className="text-primary font-bold mt-2">
                                        Skill Score: 2 / 4 = 50%
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/30 p-8">
                        <h3 className="text-xl font-bold text-on-surface mb-2 text-tertiary">2. Education Multiplier</h3>
                        <p className="text-on-surface-variant mb-6">
                            Education acts as a penalty multiplier. If a candidate meets or exceeds the required education, their multiplier is 1.0 (no penalty). If they fail to meet the requirement, their skills score is penalized.
                        </p>
                        
                        <div className="overflow-x-auto rounded-xl border border-outline-variant/30">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-surface-container-low text-on-surface-variant font-bold">
                                    <tr>
                                        <th className="p-4 border-b border-outline-variant/30">Job Requirement</th>
                                        <th className="p-4 border-b border-outline-variant/30">Candidate Deficit</th>
                                        <th className="p-4 border-b border-outline-variant/30">Multiplier (Penalty)</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-surface divide-y divide-outline-variant/20">
                                    <tr className="hover:bg-surface-container-lowest transition-colors">
                                        <td className="p-4 font-semibold text-on-surface">PhD</td>
                                        <td className="p-4 text-on-surface-variant">Candidate has Master's or below</td>
                                        <td className="p-4"><span className="px-3 py-1 bg-error-container text-error rounded-full font-bold text-xs">0.2x (-80%)</span></td>
                                    </tr>
                                    <tr className="hover:bg-surface-container-lowest transition-colors">
                                        <td className="p-4 font-semibold text-on-surface">Master's (M.S, M.Tech, MBA)</td>
                                        <td className="p-4 text-on-surface-variant">Candidate has Bachelor's or below</td>
                                        <td className="p-4"><span className="px-3 py-1 bg-error-container text-error rounded-full font-bold text-xs">0.5x (-50%)</span></td>
                                    </tr>
                                    <tr className="hover:bg-surface-container-lowest transition-colors">
                                        <td className="p-4 font-semibold text-on-surface">Bachelor's (B.S, B.Tech, B.A)</td>
                                        <td className="p-4 text-on-surface-variant">Candidate lacks a Bachelor's degree</td>
                                        <td className="p-4"><span className="px-3 py-1 bg-error-container text-error rounded-full font-bold text-xs">0.3x (-70%)</span></td>
                                    </tr>
                                    <tr className="hover:bg-surface-container-lowest transition-colors">
                                        <td className="p-4 font-semibold text-on-surface">Any / None specified</td>
                                        <td className="p-4 text-on-surface-variant">None</td>
                                        <td className="p-4"><span className="px-3 py-1 bg-primary-container text-primary rounded-full font-bold text-xs">1.0x (No penalty)</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
