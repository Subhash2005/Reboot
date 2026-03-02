"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, TrendingUp, Users,
    AlertTriangle, Target, Award,
    Zap, Brain, Activity, ArrowUpRight,
    TrendingDown, BarChart3, PieChart, Rocket
} from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';

const AnalyticsPage = () => {
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [membership, setMembership] = useState<any>(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const headers = { Authorization: `Bearer ${token}` };

                // 1. Get Startup Status
                const statusRes = await axios.get('http://localhost:5000/api/user/startup-status', { headers });
                setMembership(statusRes.data);

                if (statusRes.data.inTeam && statusRes.data.startup_id) {
                    // 2. Get Performance Data
                    const perfRes = await axios.get(`http://localhost:5000/api/startup/${statusRes.data.startup_id}/performance`, { headers });
                    setAnalytics(perfRes.data);
                }
            } catch (error) {
                console.error('Failed to fetch analytics');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) return (
        <div className="h-[70vh] flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-foreground/40 font-bold uppercase tracking-widest text-[10px]">Processing Data...</p>
            </div>
        </div>
    );

    if (!membership?.inTeam) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center text-center space-y-6">
                <div className="p-8 bg-white/5 rounded-[3rem] border border-white/10">
                    <PieChart className="w-16 h-16 text-primary opacity-20" />
                </div>
                <h2 className="text-3xl font-bold">No Startup Data</h2>
                <p className="text-foreground/40 max-w-sm">Join a startup team to view their real-time performance analytics and growth metrics.</p>
                <Link href="/dashboard/youth" className="px-8 py-4 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                    Discover Startups
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-20 max-w-7xl mx-auto">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center space-x-2 text-primary font-black text-[10px] uppercase tracking-[0.3em] mb-3">
                        <Activity className="w-4 h-4" />
                        <span>Real-time Intelligence</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight">Venture Analytics</h1>
                    <p className="text-foreground/40 mt-1 font-medium">Measuring the momentum of <span className="text-white">"{membership.project_name}"</span></p>
                </div>
                <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-2 h-fit">
                    <button className="px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/20">Performance</button>
                    <button className="px-6 py-2.5 text-foreground/40 text-xs font-bold hover:text-white transition-colors">Resources</button>
                </div>
            </header>

            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-8 bg-gradient-to-br from-primary/10 to-transparent border-primary/20 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
                    <PieChart className="w-5 h-5 text-primary mb-6" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 mb-1">Overall Completion</p>
                    <div className="flex items-end space-x-2">
                        <h2 className="text-5xl font-black">{analytics?.overallCompletion || 0}%</h2>
                        <div className="flex items-center text-emerald-500 font-bold text-xs pb-1">
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                            <span>On Track</span>
                        </div>
                    </div>
                    <div className="mt-6 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${analytics?.overallCompletion}%` }} />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="glass-card p-8 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-amber-500/10 transition-colors" />
                    <AlertTriangle className="w-5 h-5 text-amber-500 mb-6" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 mb-1">Attention Required</p>
                    <h2 className="text-2xl font-bold mt-2 truncate">{analytics?.roleAttention || 'N/A'}</h2>
                    <p className="text-[10px] text-amber-500/60 font-medium mt-2">Unit needs strategic support to maintain velocity.</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="glass-card p-8 bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors" />
                    <Award className="w-5 h-5 text-emerald-500 mb-6" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 mb-1">Startup Health</p>
                    <div className="flex items-end space-x-2">
                        <h2 className="text-4xl font-black">Elite</h2>
                        <span className="text-foreground/40 font-bold mb-1">Status</span>
                    </div>
                    <p className="text-[10px] text-emerald-500/60 font-medium mt-3 italic">"Team synergy is at peak levels."</p>
                </motion.div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Member Matrix */}
                <section className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold flex items-center space-x-2">
                            <Users className="w-5 h-5 text-primary" />
                            <span>Execution Matrix</span>
                        </h3>
                        <div className="text-[9px] font-black uppercase tracking-widest text-foreground/30 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                            Unit Distribution
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {analytics?.memberStats?.map((ms: any, i: number) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="glass-card p-6 border-b-4 border-b-primary/20 group hover:border-b-primary transition-all cursor-default"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                            {ms.username[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">{ms.username}</p>
                                            <p className="text-[9px] text-foreground/30 font-black uppercase tracking-widest">
                                                {ms.user_role === 'professional' ? 'Captain' : ms.role}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-black text-primary">{ms.score}%</div>
                                        <p className="text-[8px] font-bold text-foreground/20 uppercase">Core Score</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="flex items-center space-x-1.5 text-[8px] font-black uppercase text-emerald-500/80 mb-2">
                                            <Zap className="w-2.5 h-2.5" />
                                            <span>Strength</span>
                                        </div>
                                        <p className="text-[10px] font-bold text-white/90">{ms.strength}</p>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="flex items-center space-x-1.5 text-[8px] font-black uppercase text-rose-500/80 mb-2">
                                            <AlertTriangle className="w-2.5 h-2.5" />
                                            <span>Focus Area</span>
                                        </div>
                                        <p className="text-[10px] font-bold text-white/90">{ms.weakness}</p>
                                    </div>
                                </div>

                                <div className="mt-6 flex items-center justify-between">
                                    <div className="flex items-center space-x-2 text-[9px] font-bold text-foreground/40">
                                        <BarChart3 className="w-3 h-3" />
                                        <span>{ms.tasksCount} Active Objectives</span>
                                    </div>
                                    <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary" style={{ width: `${ms.score}%` }} />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Tactical Recommendations */}
                <aside className="space-y-6">
                    <h3 className="text-xl font-bold flex items-center space-x-2">
                        <Brain className="w-5 h-5 text-primary" />
                        <span>Tactical Insights</span>
                    </h3>

                    <div className="space-y-4">
                        <div className="glass-card p-6 bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
                            <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-4">Strategic Guidance</h4>
                            <p className="text-sm font-medium text-foreground/70 leading-relaxed mb-6">
                                Based on current velocity, focus on <span className="text-white">"{analytics?.roleAttention}"</span> to prevent bottlenecks in the next deployment phase.
                            </p>
                            <button className="w-full py-3 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                Adjust Roadmap
                            </button>
                        </div>

                        <div className="glass-card p-6 border-white/5">
                            <h4 className="text-xs font-black uppercase tracking-widest text-foreground/40 mb-4 px-2">Key Performance Indicators</h4>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                                        </div>
                                        <span className="text-xs font-bold">Velocity</span>
                                    </div>
                                    <span className="text-xs font-black text-emerald-500">Fast</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                                            <Target className="w-4 h-4 text-primary" />
                                        </div>
                                        <span className="text-xs font-bold">Accuracy</span>
                                    </div>
                                    <span className="text-xs font-black text-primary">High</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                                            <Users className="w-4 h-4 text-blue-500" />
                                        </div>
                                        <span className="text-xs font-bold">Synergy</span>
                                    </div>
                                    <span className="text-xs font-black text-blue-500">92%</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-primary/80 rounded-[2.5rem] text-white shadow-xl shadow-primary/20 border border-primary relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                                <Rocket className="w-32 h-32" />
                            </div>
                            <h4 className="text-lg font-black mb-2 uppercase italic tracking-tighter">Captain's Log</h4>
                            <p className="text-xs opacity-90 leading-normal font-medium mb-6">"Maintain defensive posture for the next 24 hours. Offensive push scheduled for Wednesday."</p>
                            <button className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest bg-white/10 px-4 py-2 rounded-xl hover:bg-white/20 transition-colors">
                                <span>Broadcast Order</span>
                                <ArrowUpRight className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default AnalyticsPage;
