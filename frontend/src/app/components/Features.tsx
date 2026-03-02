"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Brain, MessageSquare, BarChart3, Bell, Lock, Globe } from 'lucide-react';

const features = [
    { icon: <Brain className="w-6 h-6" />, title: 'AI Job Matching', desc: 'Smart recommendations tailored to your skill set, role, and career goals using real-time ML models.', color: 'from-blue-500 to-cyan-400' },
    { icon: <MessageSquare className="w-6 h-6" />, title: 'Live Team Chat', desc: 'Socket.io powered real-time messaging within startup teams. Collaborate without leaving the platform.', color: 'from-purple-500 to-pink-400' },
    { icon: <BarChart3 className="w-6 h-6" />, title: 'Performance Analytics', desc: 'Rich dashboards with charts, KPIs, and team performance tracking built for leaders and freelancers alike.', color: 'from-green-500 to-emerald-400' },
    { icon: <Bell className="w-6 h-6" />, title: 'Smart Notifications', desc: 'Real-time alerts for job matches, team updates, task completions, and follower activity.', color: 'from-orange-500 to-yellow-400' },
    { icon: <Lock className="w-6 h-6" />, title: 'Secure Auth', desc: 'Google OAuth + JWT authentication with role-based access control for every user type on the platform.', color: 'from-red-500 to-rose-400' },
    { icon: <Globe className="w-6 h-6" />, title: 'Multi-Category Hub', desc: 'One platform for Professionals, Freelancers, Youth, Part-timers, and Non-tech — each with a dedicated dashboard.', color: 'from-teal-500 to-cyan-400' },
];

const Features = () => (
    <section id="features" className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} className="text-center mb-16">
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4 block">Capabilities</span>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                    Powering the <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Next Generation</span>
                </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((f, i) => (
                    <motion.div key={i}
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                        className="glass-card hover:border-primary/30 p-8 group relative overflow-hidden h-full">
                        {/* Background Number */}
                        <span className="absolute -bottom-4 -right-2 text-9xl font-black text-white/5 select-none pointer-events-none group-hover:text-primary/10 transition-colors">
                            0{i + 1}
                        </span>

                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-6 group-hover:rotate-12 transition-transform duration-500`}>
                            {f.icon}
                        </div>

                        <h3 className="text-xl font-bold mb-4 relative z-10">{f.title}</h3>
                        <p className="text-sm text-foreground/50 leading-relaxed mb-6 relative z-10">
                            {f.desc}
                        </p>

                        <div className="flex items-center gap-2 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                            EXPLOER MORE <span className="w-8 h-px bg-primary" />
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    </section>
);

export default Features;
