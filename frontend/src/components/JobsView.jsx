import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function JobsView() {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [experience, setExperience] = useState('');
    const [education, setEducation] = useState('');
    const [department, setDepartment] = useState('');
    const [skillsInput, setSkillsInput] = useState('');

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/jobs`);
            if (response.ok) {
                const data = await response.json();
                setJobs(data);
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleCreateJob = async (e) => {
        e.preventDefault();

        const skillsList = skillsInput.split(',').map(s => s.trim()).filter(s => s);

        const newJob = {
            title,
            description,
            experience_years: experience,
            education_level: education,
            department: department,
            skills: skillsList
        };

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/jobs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newJob)
            });

            if (response.ok) {
                setIsCreating(false);
                setTitle('');
                setDescription('');
                setExperience('');
                setEducation('');
                setDepartment('');
                setSkillsInput('');
                fetchJobs();
            }
        } catch (error) {
            console.error('Error creating job:', error);
        }
    };

    return (
        <main className="flex-1 overflow-auto p-8 font-body leading-relaxed text-primary bg-surface-bright">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-headline font-bold text-on-surface">Job Management</h2>
                        <p className="text-on-surface-variant mt-1">Create and manage job requirements for candidate screening.</p>
                    </div>
                    <button
                        onClick={() => setIsCreating(!isCreating)}
                        className="bg-primary text-on-primary px-4 py-2 rounded-lg font-bold hover:bg-surface-tint/90 transition-colors cursor-pointer"
                    >
                        {isCreating ? 'Cancel' : 'Create New Job'}
                    </button>
                </div>

                {isCreating && (
                    <div className="bg-surface rounded-xl shadow-sm border border-outline-variant/20 p-6 mb-8">
                        <h3 className="text-xl font-headline font-bold text-on-surface mb-4">Create Job Role</h3>
                        <form onSubmit={handleCreateJob} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-on-surface-variant mb-1">Job Title</label>
                                    <input
                                        type="text" required
                                        value={title} onChange={(e) => setTitle(e.target.value)}
                                        className="w-full rounded-md border border-outline-variant p-2"
                                        placeholder="e.g. Senior Backend Engineer"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-on-surface-variant mb-1">Education Level Required</label>
                                    <select
                                        value={education} onChange={(e) => setEducation(e.target.value)}
                                        className="w-full rounded-md border border-outline-variant p-2 bg-surface"
                                    >
                                        <option value="">Any</option>
                                        <option value="B.Tech">B.E/B.Tech / Bachelor's</option>
                                        <option value="M.Tech">M.E/M.Tech / Master's</option>
                                        <option value="PhD">PhD</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-on-surface-variant mb-1">Department / Major</label>
                                    <select
                                        value={department} onChange={(e) => setDepartment(e.target.value)}
                                        className="w-full rounded-md border border-outline-variant p-2 bg-surface"
                                    >
                                        <option value="">Any</option>
                                        <option value="CSE">Computer Science (CSE)</option>
                                        <option value="ECE">Electronics (ECE)</option>
                                        <option value="AIML">AI & Machine Learning (AIML)</option>
                                        <option value="Data Science">Data Science</option>
                                        <option value="Mechanical">Mechanical</option>
                                        <option value="Civil">Civil</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-on-surface-variant mb-1">Experience Required (Years)</label>
                                    <input
                                        type="number" min="0" step="1"
                                        value={experience} onChange={(e) => setExperience(e.target.value)}
                                        className="w-full rounded-md border border-outline-variant p-2"
                                        placeholder="e.g. 5"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-on-surface-variant mb-1">Required Skills (Comma separated)</label>
                                <textarea
                                    required
                                    value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)}
                                    className="w-full rounded-md border border-outline-variant p-2 h-24"
                                    placeholder="e.g. Python, AWS, Docker, PostgreSQL"
                                ></textarea>
                            </div>

                            <button type="submit" className="bg-primary-container text-on-primary-container px-6 py-2 rounded-lg font-bold hover:bg-primary-container/80 transition-colors cursor-pointer">
                                Save Job
                            </button>
                        </form>
                    </div>
                )}

                {/* Jobs List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <p className="text-on-surface-variant">Loading jobs...</p>
                    ) : jobs.length === 0 ? (
                        <p className="text-on-surface-variant">No jobs found. Create one to start screening candidates.</p>
                    ) : (
                        jobs.map(job => (
                            <div
                                key={job.id}
                                onClick={() => navigate('/dashboard', { state: { jobId: job.id } })}
                                className="bg-surface rounded-xl shadow-sm border border-outline-variant/20 p-6 flex flex-col hover:shadow-md transition-shadow cursor-pointer hover:border-primary/50"
                            >
                                <h3 className="text-xl font-headline font-bold text-on-surface mb-2">{job.title}</h3>

                                <div className="space-y-2 mb-4 flex-1">
                                    <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                                        <span className="material-symbols-outlined text-[18px]">school</span>
                                        <span>{job.education_level || 'Any'} {job.department ? `(${job.department})` : ''}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                                        <span className="material-symbols-outlined text-[18px]">work</span>
                                        <span>{job.experience_years ? `${job.experience_years} Years` : 'Any'}</span>
                                    </div>
                                </div>

                                <div className="text-xs text-on-surface-variant bg-surface-container-low p-3 rounded-lg">
                                    <p className="font-semibold mb-1">Target Skills ({job.skills?.length || 0}):</p>
                                    <p className="line-clamp-2">
                                        {job.skills?.join(', ') || 'None'}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}
