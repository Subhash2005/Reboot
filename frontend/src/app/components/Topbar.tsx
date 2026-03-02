"use client";
import React, { useState, useEffect } from 'react';
import { Bell, User, CheckCircle2, Menu } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const Topbar = () => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Polling every 30s
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const res = await axios.get('http://localhost:5000/api/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data);
            setUnreadCount(res.data.filter((n: any) => !n.read_status).length);
        } catch (error: any) {
            console.error('Failed to fetch notifications');
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
    };

    const markAllRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:5000/api/notifications/read/all', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNotifications();
        } catch (error: any) {
            console.error(error);
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
    };

    return (
        <header className="h-16 md:h-20 flex items-center justify-between px-4 md:px-8 z-30 relative shrink-0">
            <div className="flex items-center space-x-4 flex-1">
                <button
                    onClick={() => {
                        if (typeof window !== 'undefined') {
                            window.dispatchEvent(new Event('toggleSidebar'));
                        }
                    }}
                    className="md:hidden p-2 text-foreground/60 hover:text-white glass rounded-xl border border-white/10 hover:bg-white/5 transition-all"
                >
                    <Menu className="w-5 h-5" />
                </button>
            </div>

            <div className="flex items-center space-x-6">
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2.5 glass rounded-xl border border-white/10 hover:bg-white/5 transition-all group"
                    >
                        <Bell className="w-5 h-5 text-foreground/60 group-hover:text-primary" />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-[#050b18]"></span>
                        )}
                    </button>

                    <AnimatePresence>
                        {showNotifications && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-4 w-80 glass border border-white/10 rounded-3xl shadow-2xl p-4 overflow-hidden z-50"
                                >
                                    <div className="flex items-center justify-between mb-4 px-2">
                                        <h3 className="text-sm font-bold">Notifications</h3>
                                        {unreadCount > 0 && (
                                            <button onClick={markAllRead} className="text-[10px] text-primary font-bold uppercase tracking-widest hover:underline">
                                                Mark all read
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                                        {notifications.length === 0 ? (
                                            <div className="py-8 text-center text-foreground/30 text-xs">
                                                No notifications yet
                                            </div>
                                        ) : (
                                            notifications.map((n: any) => (
                                                <div
                                                    key={n.id}
                                                    className={`p-3 rounded-2xl border transition-all ${!n.read_status ? 'bg-primary/5 border-primary/20' : 'bg-white/5 border-white/5'}`}
                                                >
                                                    <p className="text-xs text-foreground/80 leading-relaxed">{n.message}</p>
                                                    <p className="text-[9px] text-foreground/40 mt-1 uppercase font-bold tracking-tighter">
                                                        {new Date(n.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>

                <div className="h-10 w-px bg-white/10 mx-2"></div>

                <Link href="/profile" className="flex items-center space-x-4 hover:bg-white/5 p-1.5 pr-4 rounded-2xl transition-all border border-transparent hover:border-white/10">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent p-0.5 shadow-lg">
                        <div className="w-full h-full bg-[#050b18] rounded-[calc(0.75rem-2px)] flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-bold leading-none mb-1">User Profile</p>
                        <p className="text-[10px] text-foreground/40 uppercase tracking-widest font-bold">Standard</p>
                    </div>
                </Link>
            </div>
        </header>
    );
};

export default Topbar;
