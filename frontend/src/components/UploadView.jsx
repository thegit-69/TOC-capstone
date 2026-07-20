import React, { useState, useRef } from 'react';
import SyntaxTreeAnimation from './SyntaxTreeAnimation';

export default function UploadView() {
    const [status, setStatus] = useState('idle'); // 'idle' | 'processing' | 'complete'
    const [uploads, setUploads] = useState([]);
    const fileInputRef = useRef(null);

    const handleFileUpload = async (file) => {
        if (!file) return;
        
        setStatus('processing');
        
        const formData = new FormData();
        formData.append('file', file);

        try {
            // Send to FastAPI backend
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/upload`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setUploads(prev => [
                    { 
                        name: file.name, 
                        status: 'Success', 
                        skillsCount: data.skills ? data.skills.length : 0 
                    },
                    ...prev
                ]);
            } else {
                setUploads(prev => [
                    { 
                        name: file.name, 
                        status: 'Failed', 
                        skillsCount: 0 
                    },
                    ...prev
                ]);
            }
        } catch (error) {
            console.error("Upload error:", error);
            setUploads(prev => [
                { 
                    name: file.name, 
                    status: 'Error', 
                    skillsCount: 0 
                },
                ...prev
            ]);
        } finally {
            setStatus('complete');
        }
    };

    const onFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <main className="flex-1 flex w-full h-[calc(100vh-4rem)]">
            {/* Left Column: Upload Interface */}
            <section className="w-1/2 h-full overflow-y-auto p-8 border-r border-outline-variant/30 bg-surface-container-low/30 relative">
                <div className="max-w-xl mx-auto">
                    <h2 className="font-headline text-3xl font-bold text-primary mb-2">Upload Resumes</h2>
                    <p className="text-on-surface-variant font-body text-lg mb-8">Drop files here to extract intelligence and insights.</p>
                    
                    {/* Drop Zone */}
                    <div 
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        className="border-2 border-dashed border-outline-variant/60 rounded-xl bg-surface-container-lowest hover:bg-surface-container-lowest/80 transition-colors p-12 flex flex-col items-center justify-center text-center group relative overflow-hidden"
                    >
                        {status === 'processing' && (
                            <div className="absolute inset-0 bg-primary/5 flex flex-col items-center justify-center backdrop-blur-sm z-10">
                                <span className="material-symbols-outlined text-primary text-5xl animate-spin mb-4">settings</span>
                                <p className="font-bold text-primary">Processing Document...</p>
                            </div>
                        )}
                        
                        <div className="w-16 h-16 rounded-full bg-primary-container/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <span className="material-symbols-outlined text-4xl text-primary" style={{fontVariationSettings: "'FILL' 1"}}>cloud_upload</span>
                        </div>
                        <h3 className="font-headline text-2xl font-bold text-on-surface mb-2">Drag and drop your resume here</h3>
                        <p className="text-on-surface-variant mb-6 font-body">Supports PDF files</p>
                        
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={onFileChange} 
                            accept=".pdf" 
                            className="hidden" 
                        />
                        
                        <button 
                            onClick={triggerFileInput}
                            className="bg-primary hover:bg-surface-tint/90 text-on-primary font-bold py-3 px-8 rounded-lg shadow-sm active:scale-95 transition-all cursor-pointer z-0"
                            disabled={status === 'processing'}
                        >
                            Browse Files
                        </button>
                    </div>
                    
                    {/* Recent Uploads */}
                    <div className="mt-10">
                        <h3 className="font-headline text-xl font-bold text-primary mb-4">Recent Uploads</h3>
                        <div className="space-y-4">
                            {uploads.length === 0 && (
                                <p className="text-sm text-on-surface-variant italic">No recent uploads</p>
                            )}
                            
                            {uploads.map((upload, idx) => (
                                <div key={idx} className="bg-surface-container-lowest rounded-xl p-4 flex items-center gap-4 shadow-sm border border-outline-variant/20">
                                    <div className={`p-3 rounded-lg ${upload.status === 'Success' ? 'bg-primary-container text-primary' : 'bg-error-container text-error'}`}>
                                        <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>
                                            {upload.status === 'Success' ? 'check_circle' : 'error'}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h4 className="font-bold text-on-surface text-sm">{upload.name}</h4>
                                                <p className="text-xs text-on-surface-variant mt-0.5">
                                                    {upload.status === 'Success' 
                                                        ? `Parsed successfully • ${upload.skillsCount} key skills found` 
                                                        : 'Failed to process document'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Right Column: Compiler Engine Lifecycle */}
            <section className="w-1/2 h-full bg-background p-8 overflow-y-auto relative">
                <div className="max-w-xl mx-auto flex flex-col gap-8">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="font-headline text-3xl font-bold text-on-surface mb-2">Engine Lifecycle</h1>
                            <p className="text-on-surface-variant font-body text-sm">Real-time breakdown of structural extraction.</p>
                        </div>
                        {status === 'complete' && (
                            <button onClick={() => setStatus('idle')} className="px-4 py-2 bg-primary text-on-primary rounded-lg font-bold text-sm hover:opacity-90 cursor-pointer">
                                Clear Visualization
                            </button>
                        )}
                    </div>
                    
                    <div className="flex flex-col gap-6 relative">
                        {/* Vertical connecting line */}
                        <div className="absolute left-6 top-10 bottom-10 w-[2px] bg-outline-variant/30 z-0"></div>
                        
                        {/* Card 1: Lexical Analysis */}
                        <div className="relative z-10 flex gap-6">
                            <div className="w-12 h-12 shrink-0 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shadow-sm border border-primary/20">
                                <span className="material-symbols-outlined text-[20px]">sort</span>
                            </div>
                            <div className="flex-1 bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/20 flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-headline font-semibold text-lg text-on-surface">Lexical Analysis</h3>
                                    <span className="text-xs font-mono px-2 py-1 bg-surface-variant text-on-surface-variant rounded-md">Tokenizer</span>
                                </div>
                                <div className="h-32 w-full rounded-lg bg-surface overflow-hidden relative border border-outline-variant/30 flex items-center justify-center">
                                    <svg fill="none" height="150" viewBox="0 0 400 150" width="400" xmlns="http://www.w3.org/2000/svg">
                                        <g id="stream">
                                            <rect fill="#F3F4F6" height="30" rx="4" width="80" x="0" y="60">
                                                {status === 'processing' && <animate attributeName="x" dur="3s" from="-100" repeatCount="indefinite" to="400"></animate>}
                                            </rect>
                                            <text fill="#6B7280" fontFamily="monospace" fontSize="12" x="10" y="80">Python</text>
                                            <rect fill="#6366f1" fillOpacity="0.1" height="30" rx="4" stroke="#6366f1" strokeWidth="1" width="80" x="150" y="60">
                                                {status === 'processing' && (
                                                    <>
                                                        <animate attributeName="x" dur="3s" from="150" repeatCount="indefinite" to="650"></animate>
                                                        <animate attributeName="opacity" dur="3s" repeatCount="indefinite" values="0;1;1;0"></animate>
                                                    </>
                                                )}
                                            </rect>
                                            <text fill="#6366f1" fontFamily="monospace" fontSize="10" x="160" y="80">[TAG: SKILL]</text>
                                        </g>
                                    </svg>
                                </div>
                                <p className="text-sm text-on-surface-variant">Breaking raw text into distinct linguistic tokens and entity segments.</p>
                            </div>
                        </div>
                        
                        {/* Card 2: Syntax Parsing */}
                        <div className="relative z-10 flex gap-6">
                            <div className={`w-12 h-12 shrink-0 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-sm border border-primary-fixed/20 shadow-[0_0_15px_var(--color-primary)_inset]`}>
                                <span className={`material-symbols-outlined text-[20px] ${status === 'processing' ? 'animate-spin' : ''}`} style={{animationDuration: '3s'}}>settings</span>
                            </div>
                            <div className="flex-1 bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/20 flex flex-col gap-4 ring-1 ring-primary/20">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-headline font-semibold text-lg text-on-surface">Syntax Parsing</h3>
                                    <span className="text-xs font-mono px-2 py-1 bg-primary/10 text-primary rounded-md flex items-center gap-1">
                                        {status === 'processing' && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>}
                                        CFG Rule Engine
                                    </span>
                                </div>
                                <div className="h-40 w-full rounded-lg overflow-hidden relative border border-outline-variant/30 bg-surface">
                                    {/* ThreeJS Animation runs when processing */}
                                    <SyntaxTreeAnimation active={status === 'processing'} />
                                </div>
                                <p className="text-sm text-on-surface-variant">Applying Context-Free Grammar rules to construct the Abstract Syntax Tree.</p>
                            </div>
                        </div>
                        
                        {/* Card 3: Semantic Output */}
                        <div className={`relative z-10 flex gap-6 ${status === 'processing' ? 'opacity-70' : 'opacity-100'} transition-opacity`}>
                            <div className="w-12 h-12 shrink-0 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center shadow-sm border border-outline-variant/30">
                                <span className="material-symbols-outlined text-[20px]">data_object</span>
                            </div>
                            <div className="flex-1 bg-[#1e1e1e] rounded-xl p-6 shadow-md border border-[#333] flex flex-col gap-4 overflow-hidden relative">
                                <div className="flex items-center justify-between border-b border-[#333] pb-3 mb-2">
                                    <h3 className="font-mono font-semibold text-sm text-[#d4d4d4]">Semantic Output</h3>
                                    <span className="text-[10px] font-mono text-[#858585]">JSON Construct</span>
                                </div>
                                <div className="h-32 overflow-hidden relative w-full text-xs font-mono leading-relaxed">
                                    {/* Fades */}
                                    <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-[#1e1e1e] to-transparent z-10"></div>
                                    <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-[#1e1e1e] to-transparent z-10"></div>
                                    <div className={`${status === 'processing' ? 'code-scroll' : ''} flex flex-col pt-4`}>
                                        <pre className="text-[#d4d4d4] m-0"><span className="text-[#858585]">// Constructing Entity Node</span><br/>
{`{
  "`}<span className="text-[#9cdcfe]">candidate</span>{`": "`}<span className="text-[#ce9178]">John Doe</span>{`",
  "`}<span className="text-[#9cdcfe]">contact</span>{`": {
    "`}<span className="text-[#9cdcfe]">email</span>{`": "`}<span className="text-[#ce9178]">j.doe@example.com</span>{`"
  },
  "`}<span className="text-[#9cdcfe]">skills</span>{`": [
    "`}<span className="text-[#ce9178]">Python</span>{`", "`}<span className="text-[#ce9178]">React</span>{`"
  ]
}`}</pre>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </main>
    );
}
