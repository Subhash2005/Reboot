"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

const CTA = () => (
    <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative glass rounded-[2.5rem] p-12 md:p-16 text-center overflow-hidden border border-white/10">
                {/* Background glow */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
                    <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-secondary/20 rounded-full blur-[80px]" />
                </div>

                <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-bold px-4 py-2 rounded-full mb-8 uppercase tracking-widest">
                    <Sparkles className="w-3.5 h-3.5" />
                    Join 50,000+ Users
                </div>

                <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                    Ready to <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">Reboot</span> Your Career?
                </h2>
                <p className="text-foreground/50 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
                    Join thousands who've already found better jobs, built startup teams, and grown their income with Reboot. It's free to get started.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/register"
                        className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-primary/30 hover:scale-105 transition-transform group">
                        Get Started Free
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link href="/login"
                        className="inline-flex items-center justify-center gap-2 glass border border-white/10 font-bold px-8 py-4 rounded-2xl hover:bg-white/5 transition-all">
                        Sign In
                    </Link>
                </div>
            </motion.div>
        </div>
    </section>
);

export default CTA;
