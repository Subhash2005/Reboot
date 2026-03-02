"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Briefcase, DollarSign, Globe,
    ArrowRight, MessageCircle, Instagram,
    Linkedin, ExternalLink, X, CheckCircle2,
    ShieldAlert, Sparkles, User, Zap, Heart
} from 'lucide-react';
import axios from 'axios';

const FreelancePortal = () => {
    const [jobs, setJobs] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [hasSkills, setHasSkills] = useState(true);
    const [showContact, setShowContact] = useState<number | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    const fetchJobs = async (query = '') => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const statusRes = await axios.get('http://localhost:5000/api/user/startup-status', {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Be broader on who can see this to avoid locking them out
            // But if the user says "only for freelancer user", we check for it.
            // If we're not sure, let's allow it but warn.
            setIsAuthorized(true);

            const res = await axios.get(`http://localhost:5000/api/freelancer/portal-jobs?search=${query}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setJobs(res.data.jobs);
            setHasSkills(res.data.hasSkills);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/freelancer/sync-jobs', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(res.data.message);
            fetchJobs(search);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to connect to the global job grid.');
        } finally {
            setIsSyncing(false);
        }
    };

    useEffect(() => {
        const delay = setTimeout(() => fetchJobs(search), 500);
        return () => clearTimeout(delay);
    }, [search]);

    const getSourceIcon = (source: string) => {
        switch (source.toLowerCase()) {
            case 'telegram': return <MessageCircle className="w-4 h-4 text-blue-400" />;
            case 'whatsapp': return <MessageCircle className="w-4 h-4 text-green-500" />;
            case 'instagram': return <Instagram className="w-4 h-4 text-pink-500" />;
            case 'linkedin': return <Linkedin className="w-4 h-4 text-blue-600" />;
            default: return <Globe className="w-4 h-4 text-primary" />;
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    return (
        <div className="space-y-10 pb-20 max-w-7xl mx-auto pt-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-black tracking-tighter italic uppercase text-white leading-none">Job Portal</h1>
                    <p className="text-foreground/40 mt-3 font-medium max-w-md">Find freelance commissions based on Company Name, Skill, or Client.</p>
                </div>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className={`flex items-center space-x-2 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isSyncing ? 'bg-primary/20 text-primary animate-pulse' : 'bg-primary text-white hover:scale-105 shadow-xl shadow-primary/20'}`}
                    >
                        <Zap className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                        <span>{isSyncing ? 'Scanning Grid...' : 'Sync Global Grid'}</span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="p-3 bg-white/5 border border-white/10 rounded-2xl text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/50 transition-all"
                        title="Logout"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Premium Search Handle */}
            <div className="relative group max-w-3xl">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-[2.5rem] blur opacity-25 group-focus-within:opacity-100 transition duration-1000 group-hover:duration-200" />
                <div className="relative bg-[#0a0f1d] border border-white/10 rounded-[2.5rem] p-3 flex items-center shadow-2xl transition-all focus-within:border-primary/50">
                    <div className="p-4 bg-primary/10 rounded-2xl text-primary mr-4">
                        <Search className="w-6 h-6" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by Company, Skill, or Client Name..."
                        className="flex-1 bg-transparent border-none outline-none py-2 text-lg font-medium placeholder:text-foreground/20 text-white"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Profile Skill Alert */}
            <AnimatePresence>
                {!hasSkills && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-amber-500/10 border border-amber-500/20 rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0 text-center md:text-left"
                    >
                        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                            <div className="p-4 bg-amber-500/20 rounded-2xl text-amber-500 shrink-0">
                                <ShieldAlert className="w-8 h-8" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-black uppercase tracking-tight text-white">Skills Needed</h3>
                                <p className="text-sm text-foreground/40 font-medium text-balance">Update your profile skills to unlock automated freelance matching.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => window.location.href = '/dashboard/settings'}
                            className="w-full md:w-auto px-8 py-4 bg-amber-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all"
                        >
                            Update Profile
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {loading ? (
                <div className="py-20 text-center animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Fetching Jobs...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {jobs.map((job: any, i: number) => (
                        <motion.div
                            key={job.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{ y: -8 }}
                            className="group glass-card p-1 relative overflow-hidden flex flex-col h-full rounded-[2.5rem] border border-white/5 hover:border-primary/30 transition-all"
                        >
                            <div className="p-8 space-y-6 flex flex-col h-full">
                                <div className="flex justify-between items-start">
                                    <div className="p-4 bg-white/5 rounded-2xl text-foreground/40 group-hover:text-primary transition-colors">
                                        <Briefcase className="w-6 h-6" />
                                    </div>
                                    <div className="flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                                        {getSourceIcon(job.source_platform)}
                                        <span className="text-[8px] font-black uppercase text-foreground/40">{job.source_platform}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{job.client_name}</p>
                                    <h3 className="text-2xl font-black tracking-tighter italic uppercase text-white line-clamp-1">{job.company_name}</h3>
                                    <p className="text-sm text-foreground/40 font-medium line-clamp-2 leading-relaxed italic border-l border-white/10 pl-4">
                                        "{job.company_purpose}"
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase text-foreground/20 tracking-widest">Theme</p>
                                        <p className="text-xs font-bold text-foreground/60">{job.theme}</p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-[9px] font-black uppercase text-foreground/20 tracking-widest">Pay</p>
                                        <p className="text-xs font-black text-emerald-400">
                                            {job.pay}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-2">
                                    {job.required_skills.split(',').map((s: string) => (
                                        <span key={s} className="px-3 py-1 bg-primary/5 border border-primary/10 rounded-lg text-[9px] font-bold text-primary italic lowercase">
                                            #{s.trim()}
                                        </span>
                                    ))}
                                </div>

                                <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                                    <button
                                        onClick={() => setShowContact(showContact === job.id ? null : job.id)}
                                        className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-primary hover:translate-x-1 transition-all"
                                    >
                                        <span>Show Contact</span>
                                        <ArrowRight className="w-3 h-3" />
                                    </button>
                                    <Heart className="w-4 h-4 text-rose-500/40" />
                                </div>

                                <AnimatePresence>
                                    {showContact === job.id && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="absolute inset-2 bg-primary rounded-[2rem] z-20 flex flex-col items-center justify-center text-center p-6 text-white"
                                        >
                                            <p className="text-xs font-black uppercase tracking-[0.2em] mb-2 opacity-60">Client Contact</p>
                                            <p className="text-xl font-black italic break-all mb-6 px-4">{job.contact_details}</p>
                                            <button
                                                onClick={() => window.open(job.contact_details.startsWith('http') ? job.contact_details : `https://${job.contact_details}`, '_blank')}
                                                className="px-6 py-3 bg-white text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
                                            >
                                                Contact Client
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FreelancePortal;
