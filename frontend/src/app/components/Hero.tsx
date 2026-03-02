"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Zap, Users, BarChart3 } from 'lucide-react';

const features = [
    { title: "About", icon: <Rocket className="w-6 h-6" />, text: "Next-gen modular ecosystem." },
    { title: "Features", icon: <Zap className="w-6 h-6" />, text: "Real-time sync & AI matching." },
    { title: "How It Works", icon: <Users className="w-6 h-6" />, text: "Learn our intuitive flow." },
    { title: "Add-ons", icon: <BarChart3 className="w-6 h-6" />, text: "Extend with deep analytics." }
];

const Hero = () => {
    return (
        <section className="relative pt-32 pb-20 px-6 overflow-hidden min-h-screen flex flex-col items-center justify-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[128px]"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center max-w-4xl mx-auto"
            >
                <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-8">
                    Revitalize Your <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent italic">Income</span>
                </h1>
                <p className="text-xl text-foreground/70 mb-12 max-w-2xl mx-auto leading-relaxed">
                    A weightless, modular SaaS ecosystem designed to empower professionals, youth, and freelancers with AI-driven recommendations.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-16 max-w-6xl w-full">
                {features.map((item, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + idx * 0.1, duration: 0.5 }}
                        whileHover={{ y: -10, scale: 1.02 }}
                        className="glass-card p-8 group cursor-pointer relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="mb-4 text-primary group-hover:scale-110 transition-transform duration-300">
                            {item.icon}
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                        <p className="text-sm text-foreground/50">{item.text}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default Hero;
