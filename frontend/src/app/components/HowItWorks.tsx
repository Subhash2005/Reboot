"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Search, Handshake, TrendingUp } from 'lucide-react';

const steps = [
    {
        step: '01',
        icon: <UserPlus className="w-7 h-7" />,
        title: 'Create Your Profile',
        desc: 'Sign up in seconds with email or Google. Add your skills, experience, and choose your category — Professional, Freelancer, Youth, or Part-time.',
        color: 'from-blue-500 to-cyan-400',
    },
    {
        step: '02',
        icon: <Search className="w-7 h-7" />,
        title: 'Discover Opportunities',
        desc: 'Browse your personalized dashboard powered by AI matching. Filter by skills, pay, location, and schedule to find the perfect fit.',
        color: 'from-purple-500 to-pink-400',
    },
    {
        step: '03',
        icon: <Handshake className="w-7 h-7" />,
        title: 'Connect & Collaborate',
        desc: 'Join startup teams, apply for jobs, or pitch your freelance gig. Use live team chat and task boards to work efficiently.',
        color: 'from-green-500 to-emerald-400',
    },
    {
        step: '04',
        icon: <TrendingUp className="w-7 h-7" />,
        title: 'Grow Your Income',
        desc: 'Track your performance, get rated, build your reputation, and unlock higher-paying opportunities as your profile grows.',
        color: 'from-orange-500 to-yellow-400',
    },
];

const HowItWorks = () => (
    <section id="how-it-works" className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} className="text-center mb-16">
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4 block">The Journey</span>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 italic">
                    Simple steps to <span className="text-primary italic">Reboot</span>
                </h2>
            </motion.div>

            <div className="relative">
                {/* Visual Path Line - only on large screens */}
                <div className="hidden lg:block absolute top-[15%] left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent z-0" />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                    {steps.map((s, i) => (
                        <motion.div key={i}
                            initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                            className="group flex flex-col items-center">

                            <div className="mb-8 relative">
                                <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                                    {s.icon}
                                </div>
                                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full glass border border-white/20 flex items-center justify-center font-bold text-xs">
                                    {s.step}
                                </div>
                            </div>

                            <div className="premium-card p-6 w-full text-center group-hover:border-primary/40 transition-colors">
                                <h3 className="font-bold mb-3">{s.title}</h3>
                                <p className="text-xs text-foreground/50 leading-relaxed">
                                    {s.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    </section>
);

export default HowItWorks;
