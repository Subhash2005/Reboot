"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
    LayoutDashboard, Users, Briefcase,
    MessageSquare, Settings, ChevronLeft,
    PieChart, LogOut, Bell, Rocket, Shield, Clock
} from 'lucide-react';

const Sidebar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [membershipStatus, setMembershipStatus] = useState<any>(null);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const res = await axios.get('http://localhost:5000/api/user/startup-status', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMembershipStatus(res.data);
            } catch (error) {
                console.error('Sidebar: Failed to fetch status');
            }
        };
        fetchStatus();
    }, []);

    useEffect(() => {
        const handleToggle = () => setIsMobileOpen(prev => !prev);
        window.addEventListener('toggleSidebar', handleToggle);
        return () => window.removeEventListener('toggleSidebar', handleToggle);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    const handleLogout = () => {
        localStorage.clear();
        router.push('/login');
    };

    const isLeadOrProfessional =
        membershipStatus?.role === 'Founder' ||
        membershipStatus?.role === 'Captain & Co-Founder' ||
        membershipStatus?.globalRole === 'professional';

    const isFreelanceRole = membershipStatus?.globalRole?.toLowerCase() === 'freelancer' || membershipStatus?.globalRole?.toLowerCase() === 'freelance';
    const isPartTimeRole = membershipStatus?.globalRole?.toLowerCase() === 'part-time';
    const isNonTechRole = membershipStatus?.globalRole?.toLowerCase() === 'non-tech';

    const menuItems = isFreelanceRole
        ? [
            { name: 'Job Portal', icon: <Briefcase className="w-5 h-5" />, path: '/dashboard/freelancer' },
        ]
        : isPartTimeRole
            ? [
                { name: 'Part-Time Hub', icon: <Clock className="w-5 h-5" />, path: '/dashboard/part-time' },
            ]
            : isNonTechRole
                ? [
                    { name: 'Non-Tech Hub', icon: <Briefcase className="w-5 h-5" />, path: '/dashboard/non-tech' },
                ]
                : [
                    { name: 'Overview', icon: <LayoutDashboard className="w-5 h-5" />, path: '/dashboard' },
                    { name: 'Startups', icon: <Rocket className="w-5 h-5" />, path: '/dashboard/youth' },
                    ...(membershipStatus?.globalRole === 'professional' ? [{ name: 'Command Hub', icon: <Shield className="w-5 h-5" />, path: '/dashboard/professional' }] : []),
                    { name: 'My Team', icon: <Users className="w-5 h-5" />, path: '/dashboard/team' },
                    { name: 'Analytics', icon: <PieChart className="w-5 h-5" />, path: '/dashboard/analytics' },
                    { name: 'Messages', icon: <MessageSquare className="w-5 h-5" />, path: '/dashboard/chat' },
                ];

    return (
        <>
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}
            <motion.aside
                animate={{ width: isCollapsed ? '80px' : '280px' }}
                className={`fixed left-0 top-0 bottom-0 md:left-6 md:top-6 md:bottom-6 glass md:rounded-[2.5rem] border-r md:border border-white/10 flex flex-col z-50 overflow-hidden shadow-2xl transition-transform duration-300 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
            >
                <div className="p-6 flex items-center justify-between">
                    {!isCollapsed && (
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <Rocket className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                REBOOT
                            </span>
                        </div>
                    )}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                    >
                        <ChevronLeft className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-1 mt-4">
                    {menuItems.map((item) => (
                        <Link key={item.name} href={item.path}>
                            <div className={`
                            flex items-center space-x-4 p-4 rounded-2xl transition-all group relative
                            ${pathname === item.path ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-white/5 text-foreground/50 hover:text-white'}
                        `}>
                                <div className={`${pathname === item.path ? 'text-white' : 'text-primary group-hover:scale-110 transition-transform'}`}>
                                    {item.icon}
                                </div>
                                {!isCollapsed && <span className="font-medium">{item.name}</span>}
                                {pathname === item.path && (
                                    <motion.div layoutId="active" className="absolute left-0 w-1 h-6 bg-white rounded-r-full" />
                                )}
                            </div>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 mt-auto border-t border-white/5 space-y-2">
                    <Link href="/dashboard/settings">
                        <div className={`
                        flex items-center space-x-4 p-4 rounded-2xl transition-all
                        ${pathname === '/dashboard/settings' ? 'bg-white/10 text-white' : 'text-foreground/50 hover:text-white hover:bg-white/5'}
                    `}>
                            <Settings className="w-5 h-5" />
                            {!isCollapsed && <span className="font-medium">Settings</span>}
                        </div>
                    </Link>
                    <div
                        onClick={handleLogout}
                        className="flex items-center space-x-4 p-4 text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all cursor-pointer group"
                    >
                        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        {!isCollapsed && <span className="font-medium">Logout</span>}
                    </div>
                </div>
            </motion.aside>
        </>
    );
};

export default Sidebar;
