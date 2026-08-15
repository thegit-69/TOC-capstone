import React, { useState, useEffect } from 'react';

export default function CandidateTable() {
    const [candidates, setCandidates] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedCandidateResult, setSelectedCandidateResult] = useState(null);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/jobs`);
                if (response.ok) {
                    const data = await response.json();
                    setJobs(data);
                }
            } catch (error) {
                console.error("Failed to fetch jobs", error);
            }
        };
        fetchJobs();
    }, []);

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                setLoading(true);
                setCandidates([]); // Clear stale state to prevent map errors
                
                let url = `${import.meta.env.VITE_API_URL}/candidates`;
                if (selectedJob) {
                    url = `${import.meta.env.VITE_API_URL}/jobs/${selectedJob}/screen`;
                }
                
                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();
                    setCandidates(Array.isArray(data) ? data : []);
                } else {
                    console.error("Failed to fetch candidates. Status:", response.status);
                    setCandidates([]);
                }
            } catch (error) {
                console.error('Error fetching candidates:', error);
                setCandidates([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCandidates();
    }, [selectedJob]);

    // Handle both un-screened and screened candidates gracefully
    const renderCandidateRow = (item) => {
        const isScreened = !!selectedJob;
        const c = isScreened ? item.candidate : item;
        const score = isScreened ? item.score : null;

        if (!c) return null; // Safeguard

        return (
            <tr key={c.id} className="hover:bg-surface-container-lowest transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap font-semibold">{c.name || 'Unknown'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-on-surface-variant text-sm">{c.email || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-on-surface-variant text-sm">{c.phone || 'N/A'}</td>
                
                {isScreened && (
                    <td className="px-6 py-4 whitespace-nowrap font-bold">
                        <span className={`px-2 py-1 rounded text-sm ${score >= 80 ? 'bg-primary-container text-primary' : score >= 50 ? 'bg-tertiary-container/30 text-tertiary' : 'bg-error-container text-error'}`}>
                            {score}%
                        </span>
                    </td>
                )}
                
                <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button 
                        onClick={() => setSelectedCandidateResult(isScreened ? item : { candidate: c })}
                        className="px-4 py-1.5 border border-primary text-primary rounded-lg text-sm font-semibold hover:bg-primary-container hover:text-on-primary-container transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface cursor-pointer"
                    >
                        View Profile
                    </button>
                </td>
            </tr>
        );
    };

    return (
        <main className="flex-1 flex overflow-hidden">
            <div className="flex-1 overflow-auto p-8 font-body leading-relaxed text-primary">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Page Header */}
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-headline font-bold text-on-surface">Parsed Candidates</h2>
                            <p className="text-on-surface-variant mt-1">Review and manage recently processed resumes.</p>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-semibold text-on-surface-variant">Screen against Role:</label>
                            <select 
                                value={selectedJob} 
                                onChange={(e) => setSelectedJob(e.target.value)}
                                className="border border-outline-variant rounded-md p-2 text-sm bg-surface"
                            >
                                <option value="">-- View All Candidates --</option>
                                {jobs.map(j => (
                                    <option key={j.id} value={j.id}>{j.title}</option>
                                ))}
                            </select>
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
                                        {selectedJob && <th className="px-6 py-4 text-sm font-headline font-semibold text-secondary">Match Score</th>}
                                        <th className="px-6 py-4 text-sm font-headline font-semibold text-secondary text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant/20 text-on-surface bg-surface">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={selectedJob ? 5 : 4} className="px-6 py-8 text-center text-on-surface-variant">
                                                Loading candidates...
                                            </td>
                                        </tr>
                                    ) : candidates.length === 0 ? (
                                        <tr>
                                            <td colSpan={selectedJob ? 5 : 4} className="px-6 py-8 text-center text-on-surface-variant">
                                                No candidates found. Upload a resume to get started!
                                            </td>
                                        </tr>
                                    ) : (
                                        candidates.map(renderCandidateRow)
                                    )}
                                </tbody>
                            </table>
                        </div>
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
            </div>

            {/* Explainable AI Side Panel */}
            {selectedCandidateResult && (
                <div className="w-96 bg-surface-container-low border-l border-outline-variant/30 shadow-2xl flex flex-col h-full absolute right-0 z-50 transform transition-transform">
                    <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface">
                        <h3 className="font-headline font-bold text-lg text-on-surface">Screening Report</h3>
                        <button onClick={() => setSelectedCandidateResult(null)} className="text-on-surface-variant hover:text-error p-1 rounded-full cursor-pointer">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div>
                            <h2 className="text-xl font-bold text-on-surface">{selectedCandidateResult.candidate.name || 'Unknown'}</h2>
                            <p className="text-sm text-on-surface-variant">{selectedCandidateResult.candidate.email}</p>
                        </div>
                        
                        {selectedJob ? (
                            <>
                                <div className="bg-surface p-4 rounded-xl border border-outline-variant/20 shadow-sm text-center">
                                    <p className="text-xs font-bold uppercase text-on-surface-variant tracking-wider">Match Score</p>
                                    <p className={`text-4xl font-headline font-bold mt-1 ${selectedCandidateResult.score >= 80 ? 'text-primary' : selectedCandidateResult.score >= 50 ? 'text-tertiary' : 'text-error'}`}>
                                        {selectedCandidateResult.score}%
                                    </p>
                                    <p className="text-sm mt-2 text-on-surface-variant leading-relaxed">
                                        {selectedCandidateResult.reason}
                                    </p>
                                </div>
                                
                                <div>
                                    <h4 className="font-bold text-sm text-on-surface-variant uppercase tracking-wider mb-3">Matched Skills</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedCandidateResult.matched_skills?.length > 0 ? (
                                            selectedCandidateResult.matched_skills.map(s => (
                                                <span key={s} className="px-2 py-1 bg-primary-container text-on-primary-container rounded flex items-center gap-1 text-sm">
                                                    <span className="material-symbols-outlined text-[14px]">check</span> {s}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-sm text-on-surface-variant">None</span>
                                        )}
                                    </div>
                                </div>
                                
                                <div>
                                    <h4 className="font-bold text-sm text-on-surface-variant uppercase tracking-wider mb-3">Missing Skills</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedCandidateResult.missing_skills?.length > 0 ? (
                                            selectedCandidateResult.missing_skills.map(s => (
                                                <span key={s} className="px-2 py-1 bg-error-container text-on-error-container rounded flex items-center gap-1 text-sm">
                                                    <span className="material-symbols-outlined text-[14px]">close</span> {s}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-sm text-on-surface-variant">None</span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-bold text-sm text-on-surface-variant uppercase tracking-wider mb-1">Education</h4>
                                        <p className="text-sm text-on-surface">{selectedCandidateResult.education}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-on-surface-variant uppercase tracking-wider mb-1">Experience</h4>
                                        <p className="text-sm text-on-surface">{selectedCandidateResult.experience}</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="bg-surface-variant p-4 rounded-xl text-sm text-on-surface-variant italic">
                                Please select a Job from the dropdown above to view Explainable AI screening insights for this candidate.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}
