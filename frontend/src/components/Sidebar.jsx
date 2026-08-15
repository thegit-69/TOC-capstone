import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

export default function Sidebar({ onLogout }) {
    const navigate = useNavigate();

    return (
        <nav className="hidden md:flex flex-col h-full p-4 space-y-2 border-r border-outline-variant/30 docked left-0 w-72 bg-surface-container-low z-40">
            {/* Header */}
            <div className="flex items-center space-x-3 p-2 mb-4">
                <img
                    alt="Organization Logo"
                    className="w-10 h-10 rounded-lg object-cover bg-surface-container-highest"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCx6bNHVbC4Kicqd8WYDDAmBqSuL0Wmy2sJC3uKNOxYnKythlEY_vlhlOxbeNOYBD50QYbjqy3A05FHtVd1K8XpSxXYlW7Hrn6hrNtQPH2_ATc08qRcs0AYTuIHdugwgx79yK-2FyAWA4vLTR_lvea-6SA3yPLizGAIodBEnvxx_cmlWDsSOc1fuP4FrBEs9JHWfrZSn2lQVKH53ib1GqZgpCfLPNtyN1eZC_CpVEloyGTEBBy9vWmC"
                />
                <div>
                    <h2 className="text-xl font-headline text-on-surface font-bold tracking-tight">TOC Parser</h2>
                    <p className="text-xs text-on-surface-variant font-label">Resume Intelligence</p>
                </div>
            </div>

            <button
                onClick={() => navigate('/upload')}
                className="bg-primary text-on-primary rounded-lg px-4 py-3 mb-6 font-bold flex items-center justify-center gap-2 hover:bg-surface-tint/90 transition-colors cursor-pointer"
            >
                <span className="material-symbols-outlined text-sm">add</span>
                New Analysis
            </button>

            {/* Navigation Links */}
            <div className="space-y-1 flex-1">
                <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                        `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ease-in-out cursor-pointer active:opacity-80 ${isActive ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:bg-surface-variant'}`
                    }
                >
                    <span className="material-symbols-outlined text-lg">dashboard</span>
                    <span className="font-label text-sm">Dashboard</span>
                </NavLink>

                <NavLink 
                    to="/jobs"
                    className={({ isActive }) => 
                        `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ease-in-out cursor-pointer active:opacity-80 ${isActive ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:bg-surface-variant'}`
                    }
                >
                    <span className="material-symbols-outlined text-lg">work</span>
                    <span className="font-label text-sm">Job Management</span>
                </NavLink>

                <NavLink
                    to="/upload"
                    className={({ isActive }) =>
                        `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ease-in-out cursor-pointer active:opacity-80 ${isActive ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:bg-surface-variant'}`
                    }
                >
                    <span className="material-symbols-outlined text-lg">cloud_upload</span>
                    <span className="font-label text-sm">Upload Resumes</span>
                </NavLink>

                <NavLink
                    to="/scoring"
                    className={({ isActive }) =>
                        `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ease-in-out cursor-pointer active:opacity-80 ${isActive ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:bg-surface-variant'}`
                    }
                >
                    <span className="material-symbols-outlined text-lg">query_stats</span>
                    <span className="font-label text-sm">Scoring Engine</span>
                </NavLink>
            </div>

            {/* CTA & Footer */}
            <div className="pt-4 border-t border-outline-variant/30 space-y-4">
                <div className="space-y-1">
                    <button 
                        onClick={onLogout}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-error hover:bg-error-container/50 rounded-lg transition-all duration-200 cursor-pointer active:opacity-80"
                    >
                        <span className="material-symbols-outlined text-lg">logout</span>
                        <span className="font-label text-sm">Sign Out</span>
                    </button>
                </div>
            </div>
        </nav>
    );
}
