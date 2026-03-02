"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Clock, MapPin, Phone,
    ArrowRight, MessageCircle, Mail,
    X, CheckCircle2, Navigation,
    ShieldAlert, Sparkles, Zap, Heart,
    DollarSign, User
} from 'lucide-react';
import axios from 'axios';

interface Coords {
    lat: number;
    lon: number;
}

const PartTimePortal = () => {
    const [jobs, setJobs] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [showContact, setShowContact] = useState<number | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [locationEnabled, setLocationEnabled] = useState(false);
    const [coords, setCoords] = useState<Coords | null>(null);

    const fetchJobs = async (query = '', useLocation = false, latLon: Coords | null = null) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            let url = `http://localhost:5000/api/part-time/jobs?search=${query}`;
            if (useLocation && latLon) {
                url += `&lat=${latLon.lat}&lon=${latLon.lon}`;
            }
            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setJobs(res.data);
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
            const res = await axios.post('http://localhost:5000/api/part-time/sync', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(res.data.message);
            fetchJobs(search, locationEnabled, coords);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to connect to the global job grid.');
        } finally {
            setIsSyncing(false);
        }
    };

    const toggleLocation = () => {
        if (!locationEnabled) {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition((pos) => {
                    const newCoords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
                    setCoords(newCoords);
                    setLocationEnabled(true);
                    fetchJobs(search, true, newCoords);
                }, (err) => {
                    alert("Location access denied. Please enable it in your browser settings.");
                });
            } else {
                alert("Geolocation is not supported by your browser.");
            }
        } else {
            setLocationEnabled(false);
            setCoords(null);
            fetchJobs(search, false, null);
        }
    };

    useEffect(() => {
        const delay = setTimeout(() => fetchJobs(search, locationEnabled, coords), 500);
        return () => clearTimeout(delay);
    }, [search]);

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    return (
        <div className="space-y-10 pb-20 max-w-7xl mx-auto pt-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-black tracking-tighter italic uppercase text-white leading-none">Part-Time Hub</h1>
                    <p className="text-foreground/40 mt-3 font-medium max-w-md">Find flexible work near you—from auditing to catering, A to Z.</p>
                </div>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={toggleLocation}
                        className={`flex items-center space-x-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${locationEnabled ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/5 border border-white/10 text-foreground/60 hover:bg-white/10'}`}
                    >
                        <Navigation className={`w-4 h-4 ${locationEnabled ? 'animate-pulse' : ''}`} />
                        <span>{locationEnabled ? 'Locality Active' : 'Enable Location'}</span>
                    </button>
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

            {/* Search Bar */}
            <div className="relative group max-w-3xl">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-[2.5rem] blur opacity-25 group-focus-within:opacity-100 transition duration-1000 group-hover:duration-200" />
                <div className="relative bg-[#0a0f1d] border border-white/10 rounded-[2.5rem] p-3 flex items-center shadow-2xl transition-all focus-within:border-primary/50">
                    <div className="p-4 bg-primary/10 rounded-2xl text-primary mr-4">
                        <Search className="w-6 h-6" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search for 'Auditing', 'Catering', 'Delivery'..."
                        className="flex-1 bg-transparent border-none outline-none py-2 text-lg font-medium placeholder:text-foreground/20 text-white"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="py-20 text-center animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Fetching Opportunities...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {jobs.length === 0 ? (
                        <div className="col-span-full py-20 text-center">
                            <p className="text-foreground/20 font-black uppercase tracking-widest text-xl">No jobs found in this locality</p>
                        </div>
                    ) : (
                        jobs.map((job: any, i: number) => (
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
                                        <div className="p-4 bg-white/5 rounded-2xl text-primary">
                                            <Clock className="w-6 h-6" />
                                        </div>
                                        <div className="flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                                            <MapPin className="w-3 h-3 text-primary" />
                                            <span className="text-[8px] font-black uppercase text-foreground/40">{job.location}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black tracking-tighter italic uppercase text-white line-clamp-1">{job.work_name}</h3>
                                        <div className="flex items-center space-x-2">
                                            <DollarSign className="w-4 h-4 text-emerald-400" />
                                            <span className="text-lg font-black text-emerald-400">{job.payment}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        <div className="flex items-center space-x-2 text-[10px] font-bold text-foreground/40 italic">
                                            <div className="w-4 h-px bg-white/10" />
                                            <span>Real-Time Listing</span>
                                            <div className="w-4 h-px bg-white/10" />
                                        </div>
                                        <p className="text-xs text-foreground/30 font-medium leading-relaxed">
                                            This is a public part-time opportunity available for immediate application.
                                        </p>
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
                                                <div className="p-4 bg-white/10 rounded-full mb-4">
                                                    <User className="w-8 h-8" />
                                                </div>
                                                <p className="text-xs font-black uppercase tracking-[0.2em] mb-2 opacity-60">Listing Contact</p>
                                                <p className="text-xl font-black italic break-all mb-6 px-4">{job.contact}</p>
                                                <button
                                                    onClick={() => window.location.href = `tel:${job.contact}`}
                                                    className="px-6 py-3 bg-white text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl flex items-center space-x-2"
                                                >
                                                    <Phone className="w-3 h-3" />
                                                    <span>Call Direct</span>
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default PartTimePortal;
