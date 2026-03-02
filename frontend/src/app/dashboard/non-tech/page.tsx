"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Briefcase, ExternalLink,
    ArrowRight, MapPin, DollarSign,
    Clock, Sparkles, Filter,
    ChevronRight, X, UserCheck
} from 'lucide-react';
import axios from 'axios';

const NonTechJobsPage = () => {
    const [jobs, setJobs] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [showPreview, setShowPreview] = useState<any>(null);

    const fetchJobs = async (query = '') => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/non-tech/jobs?search=${query}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setJobs(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delay = setTimeout(() => fetchJobs(search), 500);
        return () => clearTimeout(delay);
    }, [search]);

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    return (
        <div className="min-h-screen bg-[#0a0f1d] pb-20 max-w-7xl mx-auto pt-12 px-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-5xl font-black tracking-tighter italic uppercase text-white leading-none">Non-Technical Jobs</h1>
                    <p className="text-foreground/40 mt-3 font-medium max-w-lg">BPO, Sales, Marketing, Communications & More. Your long-term career starts here.</p>
                </div>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleLogout}
                        className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/50 transition-all font-black uppercase text-[10px] tracking-widest"
                    >
                        Sign Out
                    </button>
                    <button
                        onClick={() => fetchJobs(search)}
                        className="px-8 py-3 bg-primary text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/20 flex items-center space-x-2"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>Refresh Grid</span>
                    </button>
                </div>
            </div>

            {/* Premium Search */}
            <div className="relative group max-w-3xl mb-12">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-[2.5rem] blur opacity-25 group-focus-within:opacity-100 transition duration-1000 group-hover:duration-200" />
                <div className="relative bg-[#0a0f1d] border border-white/10 rounded-[2.5rem] p-3 flex items-center shadow-2xl transition-all focus-within:border-primary/50">
                    <div className="p-4 bg-primary/10 rounded-2xl text-primary mr-4">
                        <Search className="w-6 h-6" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search for 'BPO', 'Sales Lead', 'HR'..."
                        className="flex-1 bg-transparent border-none outline-none py-2 text-lg font-medium placeholder:text-foreground/20 text-white"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Table Container */}
            <div className="glass rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5">
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-foreground/40 italic">Job Listing</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-foreground/40 italic">Industry/Role</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-foreground/40 italic">Location</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-foreground/40 italic">Interview Process</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-foreground/40 italic text-right">Acion</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="animate-spin inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Fetching Opportunities...</p>
                                    </td>
                                </tr>
                            ) : jobs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <p className="text-foreground/20 font-black uppercase tracking-widest">No listings found in categories</p>
                                    </td>
                                </tr>
                            ) : (
                                jobs.map((job: any, i: number) => (
                                    <motion.tr
                                        key={job.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                                        onClick={() => setShowPreview(job)}
                                    >
                                        <td className="px-8 py-8">
                                            <div className="flex items-center space-x-6">
                                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                    <Briefcase className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black tracking-tighter italic uppercase text-white leading-none mb-1">{job.job_title}</h3>
                                                    <p className="text-sm font-bold text-foreground/40 italic">{job.client_name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-8">
                                            <div className="inline-flex items-center px-4 py-2 bg-primary/5 border border-primary/10 rounded-xl">
                                                <span className="text-[10px] font-black uppercase text-primary italic lowercase">#{job.source || 'General Management'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-8">
                                            <div className="flex items-center space-x-2 text-foreground/60 font-medium">
                                                <MapPin className="w-4 h-4 text-primary opacity-50" />
                                                <span>Remote / Global Hub</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-8">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-xs font-black uppercase italic tracking-tighter text-white">Direct Interview</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-8 text-right">
                                            <button
                                                className="p-4 bg-white/5 rounded-2xl text-foreground/40 group-hover:bg-primary group-hover:text-white transition-all shadow-xl"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.open(job.contact_details, '_blank');
                                                }}
                                            >
                                                <ArrowRight className="w-6 h-6" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Application Sidebar / Preview Alternative */}
            <AnimatePresence>
                {showPreview && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#0a0f1d]/90 backdrop-blur-xl"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-[#0f172a] border border-white/10 max-w-2xl w-full rounded-[3rem] p-10 relative overflow-hidden shadow-2xl"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[80px]" />

                            <button
                                onClick={() => setShowPreview(null)}
                                className="absolute top-8 right-8 p-3 bg-white/5 rounded-full text-foreground/40 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <div className="inline-block px-4 py-1.5 bg-primary rounded-full text-[10px] font-black uppercase italic text-white mb-4">
                                        Opportunity Details
                                    </div>
                                    <h2 className="text-4xl font-black tracking-tighter italic uppercase text-white leading-none">{showPreview.job_title}</h2>
                                    <p className="text-xl font-bold text-primary italic uppercase leading-none">{showPreview.client_name}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-8 py-8 border-y border-white/5">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase text-foreground/20 tracking-[0.2em]">Application Link</p>
                                        <p className="text-sm font-bold text-white italic truncate">{showPreview.contact_details || 'Portal Linked'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase text-foreground/20 tracking-[0.2em]">Interview Status</p>
                                        <div className="flex items-center space-x-2 text-emerald-400">
                                            <UserCheck className="w-4 h-4" />
                                            <span className="text-xs font-black uppercase italic">Ready For Application</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase text-foreground/20 tracking-widest italic">Interview Road-Map</h4>
                                    <div className="space-y-3">
                                        {[
                                            "Aptitude & Communication Round (Pre-screening)",
                                            "HR Discussion & Cultural Fitment",
                                            "Final Direct Interview with Team Leads"
                                        ].map((step, i) => (
                                            <div key={i} className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl border border-white/5 transition-all hover:border-primary/30 group">
                                                <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-black text-xs group-hover:bg-primary group-hover:text-white">
                                                    {i + 1}
                                                </div>
                                                <span className="text-sm font-medium text-white/80">{step}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    className="w-full py-6 bg-primary text-white rounded-[2rem] font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-2xl shadow-primary/30 flex items-center justify-center space-x-4"
                                    onClick={() => window.open(showPreview.contact_details, '_blank')}
                                >
                                    <span>Proceed to Application Portal</span>
                                    <ExternalLink className="w-6 h-6" />
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NonTechJobsPage;
