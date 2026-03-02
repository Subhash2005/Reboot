"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, ShieldCheck, Zap } from 'lucide-react';

const pillars = [
    {
        icon: <Rocket className="w-6 h-6" />,
        title: 'Built for Growth',
        desc: 'Reboot is architected around your career trajectory — whether you\'re a seasoned professional or a fresh graduate.',
        color: 'from-blue-500 to-cyan-400',
    },
    {
        icon: <Zap className="w-6 h-6" />,
        title: 'AI Matching',
        desc: 'Our intelligent engine analyzes your skills and aspirations in real-time to surface the most relevant roles.',
        color: 'from-purple-500 to-pink-400',
    },
    {
        icon: <ShieldCheck className="w-6 h-6" />,
        title: 'Global Security',
        desc: 'Enterprise-grade protection with JWT authentication and secure Google OAuth integration.',
        color: 'from-green-500 to-emerald-400',
    },
];

const About = () => (
    <section id="about" className="py-24 px-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
            <div className="premium-card p-12 md:p-20 mb-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4 block">The Mission</span>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                            Closing the <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent italic">Income Gap</span>
                        </h2>
                        <p className="text-foreground/60 text-lg leading-relaxed mb-8">
                            Reboot is a weightless, modular SaaS ecosystem built to empower the modern workforce. We provide the infrastructure for individuals to discover, connect, and grow their earnings through AI-driven intelligence.
                        </p>
                        <div className="flex gap-4">
                            <div className="text-center px-6 py-4 glass rounded-2xl">
                                <p className="text-2xl font-bold">100%</p>
                                <p className="text-[10px] text-foreground/40 uppercase font-black">AI Centric</p>
                            </div>
                            <div className="text-center px-6 py-4 glass rounded-2xl">
                                <p className="text-2xl font-bold">Safe</p>
                                <p className="text-[10px] text-foreground/40 uppercase font-black">GDPR Ready</p>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        {pillars.map((p, i) => (
                            <motion.div key={i}
                                initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                                className="glass-card p-6 flex items-center gap-6 group">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                    {p.icon}
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm mb-1">{p.title}</h4>
                                    <p className="text-xs text-foreground/50 leading-relaxed">{p.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </section>
);

export default About;
