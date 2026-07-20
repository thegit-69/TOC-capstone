import React, { useState, useEffect } from 'react';

export default function CandidateTable() {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/candidates`);
                if (response.ok) {
                    const data = await response.json();
                    setCandidates(data);
                } else {
                    console.error('Failed to fetch candidates');
                }
            } catch (error) {
                console.error('Error fetching candidates:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCandidates();
    }, []);

    return (
        <main className="flex-1 overflow-auto p-8 font-body leading-relaxed text-primary">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Page Header */}
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-headline font-bold text-on-surface">Parsed Candidates</h2>
                        <p className="text-on-surface-variant mt-1">Review and manage recently processed resumes.</p>
                    </div>
                </div>
                
                {/* Data Table Card */}
                <div className="bg-surface rounded-xl shadow-[0_4px_20px_rgba(46,50,48,0.06)] border border-outline-variant/20 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface-container-low border-b border-outline-variant/30">
                                    <th className="px-6 py-4 text-sm font-headline font-semibold text-secondary">Candidate Name</th>
                                    <th className="px-6 py-4 text-sm font-headline font-semibold text-secondary">Email</th>
                                    <th className="px-6 py-4 text-sm font-headline font-semibold text-secondary">Phone</th>
                                    <th className="px-6 py-4 text-sm font-headline font-semibold text-secondary text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/20 text-on-surface bg-surface">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-on-surface-variant">
                                            Loading candidates...
                                        </td>
                                    </tr>
                                ) : candidates.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-on-surface-variant">
                                            No candidates found. Upload a resume to get started!
                                        </td>
                                    </tr>
                                ) : (
                                    candidates.map((c) => (
                                        <tr key={c.id} className="hover:bg-surface-container-lowest transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap font-semibold">{c.name || 'Unknown'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-on-surface-variant text-sm">{c.email || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-on-surface-variant text-sm">{c.phone || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <button className="px-4 py-1.5 border border-primary text-primary rounded-lg text-sm font-semibold hover:bg-primary-container hover:text-on-primary-container transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface cursor-pointer">
                                                    View Profile
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Table Footer / Pagination Area */}
                    <div className="bg-surface-container-low px-6 py-4 border-t border-outline-variant/30 flex items-center justify-between text-sm text-on-surface-variant">
                        <span>Showing {candidates.length} candidates</span>
                        <div className="flex space-x-2">
                            <button className="p-1 rounded-md hover:bg-surface-variant transition-colors disabled:opacity-50" disabled>
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>
                            <button className="p-1 rounded-md hover:bg-surface-variant transition-colors text-primary cursor-pointer disabled:opacity-50" disabled>
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
