"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Briefcase, TrendingUp, Star, Search, MapPin,
    Clock, ArrowRight, DollarSign, Rocket, Users,
    Shield, Target, Zap, Wrench, X, Check
} from 'lucide-react';
import axios from 'axios';

const ProfessionalDashboard = () => {
    const [startups, setStartups] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedStartup, setSelectedStartup] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [userStatus, setUserStatus] = useState<any>(null);
    const [fetchingStatus, setFetchingStatus] = useState(true);

    const fetchStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/user/startup-status', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserStatus(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setFetchingStatus(false);
        }
    };

    const fetchStartups = async (query = '') => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/startups/available?search=${query}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStartups(res.data);
            setError('');
        } catch (err: any) {
            console.error(err);
            setError('Failed to fetch tactical deployments.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        const delaySearch = setTimeout(() => {
            fetchStartups(search);
        }, 500);
        return () => clearTimeout(delaySearch);
    }, [search]);

    const handleAcceptCaptain = async (startupId: number) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/startup/join',
                { startupId, immediate: true },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert(res.data.message);
            setSelectedStartup(null);
            fetchStartups(search);
            // Redirect to team board if needed
            window.location.href = '/dashboard/team';
        } catch (err: any) {
            alert(err.response?.data?.message || 'Deployment failed');
        }
    };

    if (fetchingStatus) return <div className="p-10 text-center font-black animate-pulse">VERIFYING DOSSIER...</div>;

    if (!userStatus?.experience) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center text-center space-y-8">
                <div className="p-10 bg-rose-500/10 rounded-[4rem] border border-rose-500/20 relative">
                    <Shield className="w-16 h-16 text-rose-500 mx-auto" />
                    <div className="absolute -top-2 -right-2 p-3 bg-rose-500 rounded-full animate-ping opacity-20" />
                </div>
                <div className="space-y-4 max-w-lg">
                    <h2 className="text-4xl font-black italic tracking-tighter uppercase text-white">Access Restricted</h2>
                    <p className="text-foreground/40 font-medium leading-relaxed uppercase text-[10px] tracking-widest">
                        Tactical Command access requires a documented history of service. Please update your <span className="text-primary italic">Previous Job Experience</span> in your profile dossier to unlock the Command Hub.
                    </p>
                </div>
                <button
                    onClick={() => window.location.href = '/dashboard/settings'}
                    className="px-10 py-5 bg-primary text-white rounded-[2rem] font-black uppercase italic tracking-widest shadow-2xl shadow-primary/30 hover:scale-105 transition-all"
                >
                    Update Tactical Dossier
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white mb-2">Available Startups</h1>
                    <p className="text-foreground/40 text-[10px] font-black uppercase tracking-widest">Commissioned Tactical Opportunities</p>
                </div>
            </div>

            <div className="relative max-w-2xl bg-white/5 rounded-[2rem] border border-white/10 p-2 group transition-all focus-within:border-primary/50">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/30 group-focus-within:text-primary transition-colors" />
                <input
                    value={search} onChange={e => setSearch(e.target.value)}
                    type="text" placeholder="Search by tech stack, project name, or theme..."
                    className="w-full bg-transparent py-4 pl-14 pr-6 focus:outline-none text-sm font-medium"
                />
            </div>

            {loading && <div className="p-10 text-center text-primary animate-pulse font-black uppercase tracking-widest text-xs">Scanning Grid for Opportunities...</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {startups.map((s: any, i) => (
                    <motion.div
                        key={s.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -6, scale: 1.02 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => setSelectedStartup(s)}
                        className="glass-card p-8 flex flex-col gap-6 cursor-pointer border-l-4 border-l-primary group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />

                        <div className="flex items-start justify-between relative z-10">
                            <div className="p-4 rounded-[1.5rem] bg-primary/10 text-primary border border-primary/20">
                                <Rocket className="w-6 h-6" />
                            </div>
                            <div className="text-right">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-white/5 px-3 py-1.5 rounded-xl text-foreground/40 border border-white/5">
                                    {s.vacancy_count} Openings
                                </span>
                            </div>
                        </div>

                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">{s.team_name}</p>
                            <h3 className="text-xl font-black italic tracking-tighter text-white line-clamp-1">{s.project_name}</h3>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {(s.required_skill || 'Tech').split(',').map((skill: string) => (
                                <span key={skill} className="text-[9px] font-black uppercase bg-white/5 px-3 py-1 rounded-lg text-foreground/40">
                                    {skill.trim()}
                                </span>
                            ))}
                        </div>

                        <div className="mt-4 flex items-center justify-between pt-4 border-t border-white/5">
                            <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 rounded-full bg-white/5 p-1">
                                    <Shield className="w-full h-full text-foreground/30" />
                                </div>
                                <span className="text-[10px] font-bold text-foreground/60">{s.creator_name || 'Founder'}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-primary group-hover:translate-x-1 transition-transform">
                                <span className="text-[10px] font-black uppercase italic">View Mission</span>
                                <ArrowRight className="w-3 h-3" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {startups.length === 0 && !loading && (
                <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-white/10 border-dashed">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search className="w-8 h-8 text-foreground/20" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No Matches Found</h3>
                    <p className="text-sm text-foreground/40 max-w-xs mx-auto">Update your skills and experience or use the search bar to find tactical opportunities.</p>
                </div>
            )}

            {/* Detailed View Modal */}
            <AnimatePresence>
                {selectedStartup && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
                        <motion.div
                            initial={{ opacity: 0, y: 100, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 100, scale: 0.9 }}
                            className="glass w-full max-w-2xl p-10 rounded-[4rem] border border-white/10 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />

                            <button
                                onClick={() => setSelectedStartup(null)}
                                className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all text-white/40 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="relative z-10">
                                <div className="flex items-center space-x-4 mb-8">
                                    <div className="p-5 bg-primary/10 rounded-[2rem] text-primary border border-primary/20">
                                        <Rocket className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{selectedStartup.team_name}</p>
                                        <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase">{selectedStartup.project_name}</h2>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8 mb-10">
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground/30 mb-2 flex items-center space-x-2">
                                                <Target className="w-3 h-3" />
                                                <span>Theme & Vision</span>
                                            </h4>
                                            <p className="text-sm text-foreground/60 leading-relaxed italic border-l-2 border-primary/20 pl-4">
                                                {selectedStartup.theme || 'Transforming the industry through innovative tactical solutions and decentralized collaboration.'}
                                            </p>
                                        </div>

                                        <div>
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground/30 mb-2 flex items-center space-x-2">
                                                <Wrench className="w-3 h-3" />
                                                <span>Tactical Requisites</span>
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {(selectedStartup.skills_needed || selectedStartup.required_skill || 'Teamwork').split(',').map((s: string) => (
                                                    <span key={s} className="px-4 py-2 bg-primary/5 border border-primary/10 rounded-xl text-[10px] font-bold text-primary italic">
                                                        {s.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/5 rounded-[2.5rem] border border-white/5 p-6 space-y-4">
                                        <div>
                                            <p className="text-[9px] font-black uppercase text-foreground/20 tracking-widest mb-1">Founder / Admiral</p>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-black text-primary">
                                                    {selectedStartup.creator_name?.[0].toUpperCase() || 'F'}
                                                </div>
                                                <span className="text-sm font-bold text-white">{selectedStartup.creator_name || 'Anonymous Founder'}</span>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-[9px] font-black uppercase text-foreground/20 tracking-widest mb-2">Current Crew</p>
                                            <div className="flex items-center space-x-1">
                                                <div className="flex -space-x-3">
                                                    {[1, 2, 3].map(i => (
                                                        <div key={i} className="w-8 h-8 rounded-full bg-white/5 border-2 border-[#0a0f1d] flex items-center justify-center text-[8px] font-bold text-foreground/30">
                                                            P
                                                        </div>
                                                    ))}
                                                </div>
                                                <span className="text-[10px] font-black text-primary ml-2 uppercase">+{selectedStartup.vacancy_count} Openings</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => handleAcceptCaptain(selectedStartup.id)}
                                        className="flex-[2] py-5 bg-primary text-white rounded-[1.5rem] font-black uppercase italic tracking-widest flex items-center justify-center space-x-3 shadow-2xl shadow-primary/30 hover:scale-[1.02] transition-all"
                                    >
                                        <Zap className="w-5 h-5 fill-white" />
                                        <span>Accept as Captain to the Crew</span>
                                    </button>
                                    <button
                                        onClick={() => setSelectedStartup(null)}
                                        className="flex-1 py-5 bg-white/5 border border-white/10 text-foreground/40 rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center space-x-2"
                                    >
                                        <X className="w-4 h-4" />
                                        <span>Reject Mission</span>
                                    </button>
                                </div>

                                <p className="mt-6 text-center text-[9px] font-black uppercase tracking-widest text-foreground/20">
                                    Note: Accepting this commission will allocate you as the primary Captain and Co-Founder of this tactical unit.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProfessionalDashboard;
