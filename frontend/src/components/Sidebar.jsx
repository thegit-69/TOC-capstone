import React from 'react';

export default function Sidebar() {
    return (
        <nav className="hidden md:flex flex-col h-full p-4 space-y-2 border-r border-outline-variant/30 docked left-0 w-72 bg-surface-container-low">
            {/* Header */}
            <div className="flex items-center space-x-3 p-2 mb-4">
                <img 
                    alt="Organization Logo" 
                    className="w-10 h-10 rounded-lg object-cover bg-surface-container-highest" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCx6bNHVbC4Kicqd8WYDDAmBqSuL0Wmy2sJC3uKNOxYnKythlEY_vlhlOxbeNOYBD50QYbjqy3A05FHtVd1K8XpSxXYlW7Hrn6hrNtQPH2_ATc08qRcs0AYTuIHdugwgx79yK-2FyAWA4vLTR_lvea-6SA3yPLizGAIodBEnvxx_cmlWDsSOc1fuP4FrBEs9JHWfrZSn2lQVKH53ib1GqZgpCfLPNtyN1eZC_CpVEloyGTEBBy9vWmC" 
                />
                <div>
                    <h2 className="text-xl font-headline text-on-surface font-bold tracking-tight">Recruitment Hub</h2>
                    <p className="text-xs text-on-surface-variant font-label">Skills & Filters</p>
                </div>
            </div>
            
            {/* Navigation Links */}
            <div className="space-y-1 flex-1">
                {/* Active Tab: Talent Pool */}
                <a className="flex items-center space-x-3 px-3 py-2.5 bg-primary-container text-on-primary-container rounded-lg font-bold hover:bg-surface-variant transition-all duration-200 ease-in-out cursor-pointer active:opacity-80" href="#">
                    <span className="material-symbols-outlined text-lg">groups</span>
                    <span className="font-label text-sm">Talent Pool</span>
                </a>
                <a className="flex items-center space-x-3 px-3 py-2.5 text-on-surface-variant hover:bg-surface-variant rounded-lg transition-all duration-200 ease-in-out cursor-pointer active:opacity-80" href="#">
                    <span className="material-symbols-outlined text-lg">saved_search</span>
                    <span className="font-label text-sm">Saved Searches</span>
                </a>
                <a className="flex items-center space-x-3 px-3 py-2.5 text-on-surface-variant hover:bg-surface-variant rounded-lg transition-all duration-200 ease-in-out cursor-pointer active:opacity-80" href="#">
                    <span className="material-symbols-outlined text-lg">analytics</span>
                    <span className="font-label text-sm">Analytics</span>
                </a>
                <a className="flex items-center space-x-3 px-3 py-2.5 text-on-surface-variant hover:bg-surface-variant rounded-lg transition-all duration-200 ease-in-out cursor-pointer active:opacity-80" href="#">
                    <span className="material-symbols-outlined text-lg">history</span>
                    <span className="font-label text-sm">Parsing History</span>
                </a>
                
                {/* Filters Section */}
                <div className="mt-8 pt-6 border-t border-outline-variant/30">
                    <h3 className="text-xs font-headline font-semibold text-secondary uppercase tracking-wider mb-4 px-2">Quick Filters</h3>
                    <div className="space-y-3 px-2">
                        <label className="flex items-center space-x-3 cursor-pointer group">
                            <input defaultChecked className="form-checkbox text-primary rounded border-outline-variant focus:ring-primary focus:ring-offset-surface-container-low" type="checkbox" />
                            <span className="text-sm font-label text-on-surface-variant group-hover:text-primary transition-colors">Has Python</span>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer group">
                            <input className="form-checkbox text-primary rounded border-outline-variant focus:ring-primary focus:ring-offset-surface-container-low" type="checkbox" />
                            <span className="text-sm font-label text-on-surface-variant group-hover:text-primary transition-colors">Has Java</span>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer group">
                            <input defaultChecked className="form-checkbox text-primary rounded border-outline-variant focus:ring-primary focus:ring-offset-surface-container-low" type="checkbox" />
                            <span className="text-sm font-label text-on-surface-variant group-hover:text-primary transition-colors">Has Bachelor's Degree</span>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer group">
                            <input className="form-checkbox text-primary rounded border-outline-variant focus:ring-primary focus:ring-offset-surface-container-low" type="checkbox" />
                            <span className="text-sm font-label text-on-surface-variant group-hover:text-primary transition-colors">Has Master's Degree</span>
                        </label>
                    </div>
                </div>
            </div>
            
            {/* CTA & Footer */}
            <div className="pt-4 border-t border-outline-variant/30 space-y-4">
                <button className="w-full bg-primary text-on-primary py-2.5 rounded-xl font-label text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm cursor-pointer active:opacity-80">
                    Export Selected
                </button>
                <div className="space-y-1">
                    <a className="flex items-center space-x-3 px-3 py-2 text-error hover:bg-error-container/50 rounded-lg transition-all duration-200 cursor-pointer active:opacity-80" href="#">
                        <span className="material-symbols-outlined text-lg">logout</span>
                        <span className="font-label text-sm">Sign Out</span>
                    </a>
                </div>
            </div>
        </nav>
    );
}
