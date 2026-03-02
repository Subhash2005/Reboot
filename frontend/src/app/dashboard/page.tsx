"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import {
    Users, Rocket, CheckCircle2,
    TrendingUp, ArrowUpRight, Clock, Shield
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, AreaChart, Area
} from 'recharts';

const data = [
    { name: 'Mon', value: 40 },
    { name: 'Tue', value: 30 },
    { name: 'Wed', value: 60 },
    { name: 'Thu', value: 45 },
    { name: 'Fri', value: 70 },
    { name: 'Sat', value: 55 },
    { name: 'Sun', value: 80 },
];

const StatsCard = ({ title, value, icon, trend, color }: any) => (
    <div className="glass-card p-6 flex items-center justify-between group">
        <div className="space-y-2">
            <p className="text-sm font-medium text-foreground/40">{title}</p>
            <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
            <div className={`flex items-center text-xs font-bold ${trend.startsWith('+') ? 'text-green-400' : 'text-rose-400'}`}>
                {trend} <span className="text-foreground/30 ml-1 font-medium">vs last week</span>
            </div>
        </div>
        <div className={`p-4 rounded-2xl bg-${color}/10 text-${color} group-hover:scale-110 transition-transform`}>
            {icon}
        </div>
    </div>
);

const DashboardOverview = () => {
    const router = useRouter();
    const [membershipStatus, setMembershipStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/user/startup-status', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMembershipStatus(res.data);

                const gRole = res.data?.globalRole?.toLowerCase();
                if (gRole === 'freelancer' || gRole === 'freelance') {
                    router.push('/dashboard/freelancer');
                    return;
                }

                const isAdmin =
                    res.data?.role === 'Founder' ||
                    res.data?.role === 'Captain & Co-Founder' ||
                    res.data?.globalRole === 'professional';

                if (!isAdmin) {
                    router.push('/dashboard/team');
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchStatus();
    }, [router]);

    if (loading) return <div className="p-10 text-center">Verifying Authorization...</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center space-x-2 text-primary font-bold text-[10px] uppercase tracking-widest mb-2">
                        <Shield className="w-3 h-3" />
                        <span>Leadership Portal</span>
                    </div>
                    <h1 className="text-3xl font-bold mb-1">Professional Overview</h1>
                    <p className="text-foreground/40 text-sm">Welcome back, {membershipStatus?.role}. Here&apos;s your team performance.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button className="px-4 py-2 glass rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-all">Download Report</button>
                    <button className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20">New Milestone</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard title="Team Members" value="12" icon={<Users className="w-6 h-6" />} trend="+2" color="primary" />
                <StatsCard title="Active Projects" value="04" icon={<Rocket className="w-6 h-6" />} trend="+1" color="secondary" />
                <StatsCard title="Tasks Completed" value="86%" icon={<CheckCircle2 className="w-6 h-6" />} trend="+5%" color="accent" />
                <StatsCard title="Avg. Performance" value="9.2" icon={<TrendingUp className="w-6 h-6" />} trend="+0.4" color="green-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-card p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold">Revenue & Growth</h3>
                            <p className="text-xs text-foreground/40">Monthly performance analytics</p>
                        </div>
                        <select className="bg-white/5 border border-white/10 rounded-lg text-xs p-1.5 outline-none">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                        </select>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="name" stroke="#ffffff30" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#ffffff30" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ background: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                                    itemStyle={{ color: '#0ea5e9' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card p-8 group">
                    <h3 className="text-lg font-bold mb-6">Recent Activities</h3>
                    <div className="space-y-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-start space-x-4">
                                <div className="p-2.5 rounded-xl bg-white/5 text-primary">
                                    <Clock className="w-4 h-4" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">New task assigned to <span className="text-primary">@alex</span></p>
                                    <p className="text-[10px] text-foreground/40">2 hours ago</p>
                                </div>
                                <ArrowUpRight className="w-4 h-4 ml-auto text-foreground/20 group-hover:text-primary transition-colors" />
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-8 py-3 text-sm font-bold text-foreground/40 hover:text-white transition-colors border border-dashed border-white/10 rounded-xl">
                        View All Activities
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
