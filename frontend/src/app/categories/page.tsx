"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Briefcase, UserPlus, Globe, Cpu, Clock, User as UserIcon } from 'lucide-react';

const categories = [
    { title: "Professionals", icon: <Briefcase className="w-10 h-10" />, color: "from-blue-500 to-cyan-400", href: "/dashboard/professional" },
    { title: "Unemployed Youth", icon: <UserPlus className="w-10 h-10" />, color: "from-purple-500 to-pink-400", href: "/dashboard/youth" },
    { title: "Freelancer", icon: <Globe className="w-10 h-10" />, color: "from-green-500 to-emerald-400", href: "/dashboard/freelancer" },
    { title: "Non Technical", icon: <Cpu className="w-10 h-10" />, color: "from-orange-500 to-yellow-400", href: "/dashboard/non-tech" },
    { title: "Part Time", icon: <Clock className="w-10 h-10" />, color: "from-red-500 to-rose-400", href: "/dashboard/part-time" }
];

const CategoryPage = () => {
    return (
        <div className="min-h-screen pt-32 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        Choose Your Path
                    </h1>
                    <Link href="/profile" className="p-3 glass rounded-full hover:bg-white/10 transition-all border border-white/10">
                        <UserIcon className="w-6 h-6 text-primary" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
                    {categories.map((cat, idx) => (
                        <Link key={idx} href={cat.href} className="relative group h-80 w-full block">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ y: -20, scale: 1.05 }}
                                className="relative h-full w-full"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500`}></div>
                                <div className="glass-card h-full w-full p-8 flex flex-col items-center justify-center text-center space-y-6 group-hover:border-white/20 transition-all">
                                    <div className={`p-5 rounded-2xl bg-gradient-to-br ${cat.color} group-hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all duration-500`}>
                                        {cat.icon}
                                    </div>
                                    <h3 className="text-xl font-bold tracking-tight">{cat.title}</h3>
                                    <div className="absolute bottom-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-xs font-semibold tracking-[0.2em] uppercase text-primary">Explore Path</span>
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CategoryPage;
