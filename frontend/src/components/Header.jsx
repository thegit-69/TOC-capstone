import React from 'react';

export default function Header() {
    return (
        <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 w-full bg-surface-bright shadow-sm border-b border-outline-variant/20">
            {/* Brand & Search (on left) */}
            <div className="flex items-center space-x-8 flex-1">
                <h1 className="text-2xl font-headline font-bold text-primary tracking-tight">TOC Parser</h1>
                <div className="relative max-w-md w-full hidden sm:block">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
                    <input 
                        className="w-full bg-surface-container-low border-none rounded-full py-2.5 pl-10 pr-4 text-sm font-body text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:bg-surface transition-all outline-none" 
                        placeholder="Search candidate resumes..." 
                        type="text" 
                    />
                </div>
            </div>
            
            {/* Trailing Actions */}
            <div className="flex items-center space-x-4">
                <button className="p-2 text-secondary hover:text-primary-container hover:bg-surface-variant rounded-full transition-colors cursor-pointer active:opacity-80">
                    <span className="material-symbols-outlined">notifications</span>
                </button>
                <button className="p-2 text-secondary hover:text-primary-container hover:bg-surface-variant rounded-full transition-colors cursor-pointer active:opacity-80">
                    <span className="material-symbols-outlined">settings</span>
                </button>
                <div className="h-8 w-px bg-outline-variant/30 mx-2"></div>
                <img 
                    alt="Recruiter profile" 
                    className="w-9 h-9 rounded-full object-cover border-2 border-surface-container-high cursor-pointer hover:border-primary transition-colors" 
                    data-alt="A professional headshot of a smiling recruitment manager in their 30s, warm lighting, natural earthy background with soft focus, highly detailed, professional photography style." 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7GP17XPC1ZN1EYXezuc68qehl4VGDwJ_t3FCKwJW2TIWnG7i8OtRnf3Wc5dTHv81bgsYkmhT8_Iw6Ix54-arZbdFIYMd2iT5Nmtl_Roce0OKrH6ibt5Y9f1nCq4XY4v30dR0hKIhe0sOFoo1avXztFBy2KVmHBfuPhvOoP2ew10mKYCo2uEuspB6cPdQVha3vyTrSp-T9fGRb9n36ZY9hEB-iBtTXgDE0QloaWeWVU1BpZ4eFfQL9" 
                />
            </div>
        </header>
    );
}
