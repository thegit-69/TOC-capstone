import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function CandidateTable() {
    const location = useLocation();
    const [candidates, setCandidates] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(location.state?.jobId || '');
    const [loading, setLoading] = useState(true);
    const [selectedCandidateResult, setSelectedCandidateResult] = useState(null);
    const [showJobScoringModal, setShowJobScoringModal] = useState(false);
    
    const selectedJobObj = jobs.find(j => j.id === selectedJob);

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

    const handleDeleteCandidate = async (id) => {
        if (!confirm("Are you sure you want to delete this candidate?")) return;
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/candidates/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                setCandidates(prev => prev.filter(c => (c.candidate ? c.candidate.id : c.id) !== id));
                setSelectedCandidateResult(null);
            } else {
                alert("Failed to delete candidate.");
            }
        } catch (error) {
            console.error(error);
            alert("Error deleting candidate.");
        }
    };

    const handleStatusUpdate = async (id, status, missingSkills = []) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/candidates/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    status,
                    missing_skills: missingSkills
                })
            });
            if (response.ok) {
                setCandidates(prev => prev.map(item => {
                    const c = item.candidate || item;
                    if (c.id === id) {
                        if (item.candidate) {
                            return { ...item, candidate: { ...c, status } };
                        }
                        return { ...c, status };
                    }
                    return item;
                }));
                // Also update the currently viewed modal state if open
                setSelectedCandidateResult(prev => {
                    if (!prev) return prev;
                    if (prev.candidate) {
                        return { ...prev, candidate: { ...prev.candidate, status } };
                    }
                    return { ...prev, status };
                });
            } else {
                alert("Failed to update status.");
            }
        } catch (error) {
            console.error(error);
            alert("Error updating status.");
        }
    };

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
                
                <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                        c.status === 'accept' ? 'bg-primary-container text-primary' :
                        c.status === 'reject' ? 'bg-error-container text-error' :
                        'bg-surface-variant text-on-surface-variant'
                    }`}>
                        {c.status || 'pending'}
                    </span>
                </td>
                
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
                        
                        <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-4">
                                <label className="text-sm font-semibold text-on-surface-variant">Screen against Role:</label>
                                <select 
                                    value={selectedJob} 
                                    onChange={(e) => setSelectedJob(e.target.value)}
                                    className="border border-outline-variant rounded-md p-2 text-sm bg-surface cursor-pointer focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                >
                                    <option value="">-- View All Candidates --</option>
                                    {jobs.map(j => (
                                        <option key={j.id} value={j.id}>{j.title}</option>
                                    ))}
                                </select>
                            </div>
                            {selectedJobObj && (
                                <button 
                                    onClick={() => setShowJobScoringModal(true)}
                                    className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-[14px]">help</span>
                                    How is this scored?
                                </button>
                            )}
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
                                        <th className="px-6 py-4 text-sm font-headline font-semibold text-secondary">Status</th>
                                        {selectedJob && <th className="px-6 py-4 text-sm font-headline font-semibold text-secondary">Match Score</th>}
                                        <th className="px-6 py-4 text-sm font-headline font-semibold text-secondary text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant/20 text-on-surface bg-surface">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={selectedJob ? 6 : 5} className="px-6 py-8 text-center text-on-surface-variant">
                                                Loading candidates...
                                            </td>
                                        </tr>
                                    ) : candidates.length === 0 ? (
                                        <tr>
                                            <td colSpan={selectedJob ? 6 : 5} className="px-6 py-8 text-center text-on-surface-variant">
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

            {/* Explainable AI Modal */}
            {selectedCandidateResult && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-surface-container-low rounded-2xl shadow-2xl flex flex-col w-full max-w-4xl max-h-[90vh] overflow-hidden border border-outline-variant/30">
                        <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface">
                            <div>
                                <h3 className="font-headline font-bold text-2xl text-on-surface">Screening Report</h3>
                                <p className="text-sm text-on-surface-variant mt-1">Detailed AI analysis and candidate profile</p>
                            </div>
                            <button onClick={() => setSelectedCandidateResult(null)} className="text-on-surface-variant hover:text-error p-2 rounded-full cursor-pointer hover:bg-surface-variant transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-surface">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-3xl font-bold text-on-surface">{selectedCandidateResult.candidate.name || 'Unknown'}</h2>
                                    <p className="text-on-surface-variant mt-1">{selectedCandidateResult.candidate.email} • {selectedCandidateResult.candidate.phone || 'No phone'}</p>
                                </div>
                                <div>
                                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider ${
                                        selectedCandidateResult.candidate.status === 'accept' ? 'bg-primary-container text-primary' :
                                        selectedCandidateResult.candidate.status === 'reject' ? 'bg-error-container text-error' :
                                        'bg-surface-variant text-on-surface-variant'
                                    }`}>
                                        {selectedCandidateResult.candidate.status || 'pending'}
                                    </span>
                                </div>
                            </div>
                            
                            {selectedJob ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="bg-surface p-6 rounded-xl border border-outline-variant/20 shadow-sm text-center">
                                            <p className="text-sm font-bold uppercase text-on-surface-variant tracking-wider">Match Score</p>
                                            <p className={`text-6xl font-headline font-bold mt-2 ${selectedCandidateResult.score >= 80 ? 'text-primary' : selectedCandidateResult.score >= 50 ? 'text-tertiary' : 'text-error'}`}>
                                                {selectedCandidateResult.score}%
                                            </p>
                                            <p className="text-sm mt-3 text-on-surface-variant leading-relaxed">
                                                {selectedCandidateResult.reason}
                                            </p>
                                        </div>
                                        
                                        <div className="space-y-4 bg-surface-container-low p-6 rounded-xl border border-outline-variant/20">
                                            <div>
                                                <h4 className="font-bold text-sm text-on-surface-variant uppercase tracking-wider mb-1">Education</h4>
                                                <p className="text-sm text-on-surface font-medium">{selectedCandidateResult.education}</p>
                                            </div>
                                            <div className="border-t border-outline-variant/30 pt-4">
                                                <h4 className="font-bold text-sm text-on-surface-variant uppercase tracking-wider mb-1">Experience</h4>
                                                <p className="text-sm text-on-surface font-medium">{selectedCandidateResult.experience}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/20">
                                            <h4 className="font-bold text-sm text-on-surface-variant uppercase tracking-wider mb-4">Matched Skills</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedCandidateResult.matched_skills?.length > 0 ? (
                                                    selectedCandidateResult.matched_skills.map(s => (
                                                        <span key={s} className="px-3 py-1.5 bg-primary-container text-on-primary-container rounded-lg flex items-center gap-1.5 text-sm font-medium">
                                                            <span className="material-symbols-outlined text-[16px]">check</span> {s}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-sm text-on-surface-variant italic">None found</span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/20">
                                            <h4 className="font-bold text-sm text-on-surface-variant uppercase tracking-wider mb-4">Missing Skills</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedCandidateResult.missing_skills?.length > 0 ? (
                                                    selectedCandidateResult.missing_skills.map(s => (
                                                        <span key={s} className="px-3 py-1.5 bg-error-container text-on-error-container rounded-lg flex items-center gap-1.5 text-sm font-medium">
                                                            <span className="material-symbols-outlined text-[16px]">close</span> {s}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-sm text-on-surface-variant italic">None</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-surface-variant p-6 rounded-xl text-center text-on-surface-variant">
                                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">analytics</span>
                                    <p className="text-lg">Please select a Job from the dropdown to view Explainable AI screening insights.</p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-outline-variant/30 bg-surface flex justify-between items-center">
                            <button 
                                onClick={() => handleDeleteCandidate(selectedCandidateResult.candidate.id)}
                                className="flex items-center gap-2 px-4 py-2.5 text-error hover:bg-error-container hover:text-on-error-container rounded-lg font-semibold transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[20px]">delete</span>
                                Delete Candidate
                            </button>

                            <div className="flex gap-4">
                                <button 
                                    onClick={() => handleStatusUpdate(selectedCandidateResult.candidate.id, 'reject', selectedCandidateResult.missing_skills)}
                                    className="px-6 py-2.5 border border-error text-error rounded-lg font-bold hover:bg-error-container hover:text-on-error-container transition-colors cursor-pointer flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[18px]">thumb_down</span> Reject
                                </button>
                                <button 
                                    onClick={() => handleStatusUpdate(selectedCandidateResult.candidate.id, 'accept')}
                                    className="px-8 py-2.5 bg-primary text-on-primary rounded-lg font-bold hover:bg-primary/90 shadow-md transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[18px]">thumb_up</span> Accept
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Job Scoring Modal */}
            {showJobScoringModal && selectedJobObj && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <div 
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                        onClick={() => setShowJobScoringModal(false)}
                    ></div>
                    
                    <div className="relative bg-surface rounded-2xl shadow-xl border border-outline-variant/30 w-full max-w-lg flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low/50">
                            <h3 className="font-headline font-bold text-xl text-on-surface">
                                Scoring Breakdown
                            </h3>
                            <button 
                                onClick={() => setShowJobScoringModal(false)}
                                className="p-2 hover:bg-surface-variant rounded-full text-on-surface-variant transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        {/* Content */}
                        <div className="p-6 space-y-6">
                            <div>
                                <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Target Skills (Jaccard Union)</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedJobObj.skills && selectedJobObj.skills.length > 0 ? (
                                        selectedJobObj.skills.map((s, idx) => (
                                            <span key={idx} className="bg-primary-container text-on-primary-container px-2 py-1 rounded-md text-sm">
                                                {s}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-sm text-on-surface-variant">No specific skills required.</span>
                                    )}
                                </div>
                                <p className="text-xs text-on-surface-variant mt-2">
                                    Base score is calculated by: (Candidate's matching skills) / (Target Skills + Candidate's unrelated skills).
                                </p>
                            </div>
                            
                            <div className="border-t border-outline-variant/30 pt-4">
                                <h4 className="text-sm font-bold text-tertiary uppercase tracking-wider mb-2">Education Multiplier Penalty</h4>
                                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/20">
                                    <p className="text-sm text-on-surface font-semibold mb-1">
                                        Required: {selectedJobObj.education_level || "Any / None"}
                                    </p>
                                    <p className="text-xs text-on-surface-variant">
                                        {selectedJobObj.education_level?.includes('PhD') ? "If candidate lacks a PhD, score is multiplied by 0.2x (-80%)." :
                                         selectedJobObj.education_level?.includes('M.Tech') ? "If candidate lacks a Master's degree, score is multiplied by 0.5x (-50%)." :
                                         selectedJobObj.education_level?.includes('B.Tech') ? "If candidate lacks a Bachelor's degree, score is multiplied by 0.3x (-70%)." :
                                         "No education penalty will be applied for this role."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
