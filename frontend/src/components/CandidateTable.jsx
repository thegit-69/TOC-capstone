import React from 'react';

// Hardcoded data matching the HTML template for now
const candidates = [
    {
        name: "Eleanor Vance",
        email: "e.vance@example.com",
        skills: ["Python", "Django", "AWS"],
        education: "M.S. Computer Science",
        status: "Success"
    },
    {
        name: "Julian Crane",
        email: "j.crane@example.com",
        skills: ["Java", "Spring Boot"],
        education: "B.S. Software Engineering",
        status: "Success"
    },
    {
        name: "Sarah Jenkins",
        email: "s.jenkins@example.com",
        skills: ["React", "TypeScript"],
        education: "B.A. Graphic Design",
        status: "Success"
    },
    {
        name: "Marcus Webb",
        email: "m.webb@example.com",
        skills: ["Python", "Data Analysis", "SQL"],
        education: "Ph.D. Statistics",
        status: "Success"
    },
    {
        name: "Elena Rostova",
        email: "e.rostova@example.com",
        skills: ["Product Management", "Agile"],
        education: "MBA",
        status: "Success"
    }
];

export default function CandidateTable() {
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
                                    <th className="px-6 py-4 text-sm font-headline font-semibold text-secondary">Top Skills</th>
                                    <th className="px-6 py-4 text-sm font-headline font-semibold text-secondary">Highest Education</th>
                                    <th className="px-6 py-4 text-sm font-headline font-semibold text-secondary">Parse Status</th>
                                    <th className="px-6 py-4 text-sm font-headline font-semibold text-secondary text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/20 text-on-surface bg-surface">
                                {candidates.map((c, index) => (
                                    <tr key={index} className="hover:bg-surface-container-lowest transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap font-semibold">{c.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-on-surface-variant text-sm">{c.email}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                {c.skills.map((skill, sIdx) => (
                                                    <span key={sIdx} className="px-2.5 py-1 bg-surface-container-highest text-on-surface-variant text-xs rounded-full">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-on-surface-variant">{c.education}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center space-x-1 px-3 py-1 bg-primary-container text-on-primary-container text-xs font-bold rounded-full">
                                                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                                <span>{c.status}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button className="px-4 py-1.5 border border-primary text-primary rounded-lg text-sm font-semibold hover:bg-primary-container hover:text-on-primary-container transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface cursor-pointer">
                                                View Profile
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Table Footer / Pagination Area */}
                    <div className="bg-surface-container-low px-6 py-4 border-t border-outline-variant/30 flex items-center justify-between text-sm text-on-surface-variant">
                        <span>Showing 1 to {candidates.length} of 42 candidates</span>
                        <div className="flex space-x-2">
                            <button className="p-1 rounded-md hover:bg-surface-variant transition-colors disabled:opacity-50" disabled>
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>
                            <button className="p-1 rounded-md hover:bg-surface-variant transition-colors text-primary cursor-pointer">
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
