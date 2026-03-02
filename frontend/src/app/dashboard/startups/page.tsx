"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Plus, Users, Search, Filter, ShieldCheck, Clock } from 'lucide-react';

const StartupsPage = () => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-1">Explore Ventures</h1>
                    <p className="text-foreground/40 text-sm">Find the perfect team to collaborate and innovate.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button className="p-3 glass rounded-xl hover:bg-white/5 transition-all border border-white/10">
                        <Filter className="w-5 h-5 text-foreground/60" />
                    </button>
                    <button className="px-6 py-3 bg-primary text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary/20">
                        Create Yours
                    </button>
                </div>
            </div>

            <div className="relative max-w-2xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/30" />
                <input
                    type="text" placeholder="Search by tech stack, project title, or team..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary transition-all shadow-xl"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -10 }}
                        className="glass-card p-0 overflow-hidden group border border-white/5 hover:border-primary/30 transition-all duration-500"
                    >
                        <div className="h-2 bg-gradient-to-r from-primary via-accent to-secondary"></div>
                        <div className="p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="p-3 bg-white/5 rounded-2xl">
                                    <Rocket className="w-6 h-6 text-primary group-hover:scale-110 group-hover:rotate-12 transition-transform" />
                                </div>
                                <div className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-black uppercase tracking-widest">
                                    <ShieldCheck className="w-3 h-3" />
                                    <span>Verified</span>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold">Project Nova</h3>
                                <p className="text-xs text-primary font-bold uppercase tracking-widest mt-1">Starlight Systems</p>
                            </div>

                            <p className="text-sm text-foreground/50 leading-relaxed line-clamp-2">
                                Building the next generation of decentralized workforce management using AI matching and blockchain verification.
                            </p>

                            <div className="flex items-center space-x-6 pt-2">
                                <div className="flex items-center space-x-2">
                                    <Users className="w-4 h-4 text-foreground/30" />
                                    <span className="text-xs font-bold">4/8 Members</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Clock className="w-4 h-4 text-foreground/30" />
                                    <span className="text-xs font-bold">2 Months Left</span>
                                </div>
                            </div>

                            <button className="w-full py-4 glass rounded-2xl group-hover:bg-primary group-hover:text-white transition-all font-bold text-sm border border-white/10 flex items-center justify-center space-x-2">
                                <span>View Details</span>
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default StartupsPage;
