"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Users, Briefcase, Globe, TrendingUp } from 'lucide-react';

const stats = [
    { value: '50K+', label: 'Active Users', icon: <Users className="w-5 h-5" />, color: 'from-blue-500 to-cyan-400' },
    { value: '12K+', label: 'Jobs Matched', icon: <Briefcase className="w-5 h-5" />, color: 'from-purple-500 to-pink-400' },
    { value: '98%', label: 'Success Rate', icon: <TrendingUp className="w-5 h-5" />, color: 'from-green-500 to-emerald-400' },
    { value: '30+', label: 'Cities Covered', icon: <Globe className="w-5 h-5" />, color: 'from-orange-500 to-yellow-400' },
];

const Stats = () => (
    <section className="py-16 px-6 relative">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
                <motion.div key={i}
                    initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    className="glass-card p-6 text-center group hover:border-white/20 transition-all">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                        {s.icon}
                    </div>
                    <p className={`text-3xl font-bold bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>{s.value}</p>
                    <p className="text-sm text-foreground/50 mt-1 font-medium">{s.label}</p>
                </motion.div>
            ))}
        </div>
    </section>
);

export default Stats;
