import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
    const navigate = useNavigate();

    return (
        <div className="relative min-h-screen bg-[#0f172a] text-white overflow-hidden selection:bg-purple-500 selection:text-white">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-float" />
                <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] bg-blue-600/20 rounded-full blur-[100px] animate-float delay-100" />
                <div className="absolute bottom-[-10%] left-[20%] w-[35%] h-[35%] bg-indigo-600/20 rounded-full blur-[120px] animate-float delay-200" />
            </div>

            {/* Navbar */}
            <nav className="relative z-50 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">TownSquare</span>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/login')}
                        className="px-6 py-2.5 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                    >
                        Login
                    </button>
                    <button
                        onClick={() => navigate('/signup')}
                        className="px-6 py-2.5 text-sm font-medium bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                    >
                        Sign Up
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 px-6 pt-20 pb-32 max-w-7xl mx-auto flex flex-col items-center text-center">
                <div className="mb-0"></div>

                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 animate-fade-in-delay-1">
                    <span className="block text-white mb-2">Build a Better</span>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">
                        Community Together
                    </span>
                </h1>

                <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-12 leading-relaxed animate-fade-in-delay-2">
                    TownSquare connects you with your local community. Report issues, track progress,
                    and collaborate with neighbors to create a safer, vibrant neighborhood.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-delay-3 w-full sm:w-auto">
                    <button
                        onClick={() => navigate('/signup')}
                        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-semibold shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                        Get Started
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-8 py-4 bg-white/5 text-white border border-white/10 rounded-2xl font-semibold hover:bg-white/10 transition-all duration-300 flex items-center justify-center"
                    >
                        Existing Member
                    </button>
                </div>
            </main>

            {/* Features Grid */}
            <section className="relative z-10 px-6 pb-32 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Feature 1 */}
                    <div className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-500 hover:-translate-y-2">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-500" />
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                <svg className="w-7 h-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Voice Your Concerns</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Easily report local issues like potholes, streetlights, or sanitation directly to community leaders.
                            </p>
                        </div>
                    </div>

                    {/* Feature 2 */}
                    <div className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-500 hover:-translate-y-2">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-500" />
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                <svg className="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 01-.553-.894L15 7m0 13V7" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Interactive Maps</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Visualize community issues on a real-time map. See what's happening around you instantly.
                            </p>
                        </div>
                    </div>

                    {/* Feature 3 */}
                    <div className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-500 hover:-translate-y-2">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-500" />
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                <svg className="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Community First</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Connect with your neighbors, discuss solutions, and build a stronger, safer community together.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/10 bg-[#0f172a]">
                <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">TS</span>
                        </div>
                        <span className="text-lg font-bold text-gray-200">TownSquare</span>
                    </div>

                    <div className="text-gray-500 text-sm">
                        &copy; {new Date().getFullYear()} TownSquare. All rights reserved.
                    </div>

                    <div className="flex gap-6">
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Home;
