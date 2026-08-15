import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginView({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    onLogin();
                    navigate('/dashboard');
                }
            } else {
                setError('Invalid username or password');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Failed to connect to the server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface-bright flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-surface rounded-3xl shadow-xl border border-outline-variant/30 overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-8 pb-6 border-b border-outline-variant/20 bg-surface-container-low/50 text-center">
                    <div className="w-16 h-16 bg-primary-container text-on-primary-container rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-sm border border-primary/20">
                        <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
                    </div>
                    <h2 className="text-2xl font-headline font-bold text-on-surface tracking-tight">Welcome Back</h2>
                    <p className="text-on-surface-variant text-sm mt-1">Please log in to access the TOC Parser admin dashboard.</p>
                </div>
                
                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-error-container text-error px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">error</span>
                                {error}
                            </div>
                        )}
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-on-surface-variant mb-1 ml-1 uppercase tracking-wider">Username</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/50">person</span>
                                    <input 
                                        type="text" 
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-surface-container-lowest border border-outline-variant/50 text-on-surface rounded-xl p-3 pl-10 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-on-surface-variant/40"
                                        placeholder="Enter your username"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-on-surface-variant mb-1 ml-1 uppercase tracking-wider">Password</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/50">lock</span>
                                    <input 
                                        type="password" 
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-surface-container-lowest border border-outline-variant/50 text-on-surface rounded-xl p-3 pl-10 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-on-surface-variant/40"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-primary text-on-primary font-bold py-3.5 px-4 rounded-xl shadow-md hover:bg-surface-tint/90 hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                            ) : (
                                <>
                                    Login
                                    <span className="material-symbols-outlined text-[18px]">login</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
