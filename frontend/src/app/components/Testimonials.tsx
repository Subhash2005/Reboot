"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
    {
        name: 'Arjun Mehta',
        role: 'Software Engineer → Freelancer',
        avatar: 'AM',
        color: 'from-blue-500 to-cyan-400',
        rating: 5,
        text: 'Reboot helped me transition from a 9-to-5 job to full-time freelancing within 3 months. The AI matching was spot-on — every gig it suggested was exactly in my skill zone.',
    },
    {
        name: 'Priya Sharma',
        role: 'Fresh Graduate',
        avatar: 'PS',
        color: 'from-purple-500 to-pink-400',
        rating: 5,
        text: 'As a newcomer with no connections, Reboot\'s Startup Hub let me join a real team, gain experience, and build a portfolio. I got my first job offer within 6 weeks!',
    },
    {
        name: 'Ravi Kumar',
        role: 'Non-Tech Professional',
        avatar: 'RK',
        color: 'from-green-500 to-emerald-400',
        rating: 5,
        text: 'I was skeptical at first, but the Non-Tech dashboard had exactly the HR roles I was looking for. The profile matching is genuinely better than any job board I\'ve used.',
    },
    {
        name: 'Sneha Patel',
        role: 'College Student',
        avatar: 'SP',
        color: 'from-orange-500 to-yellow-400',
        rating: 5,
        text: 'Found 3 part-time remote gigs through Reboot that fit perfectly around my college schedule. The hourly pay was 40% better than what I found on other platforms.',
    },
];

const Testimonials = () => (
    <section className="py-24 px-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} className="text-center mb-16">
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4 block">Testimonials</span>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                    Real Stories, <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent italic">Verified Growth</span>
                </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {testimonials.map((t, i) => (
                    <motion.div key={i}
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                        className="glass-card p-10 group relative overflow-hidden flex flex-col">

                        <div className="flex items-center gap-1 mb-6">
                            {Array(t.rating).fill(0).map((_, j) => (
                                <Star key={j} className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                            ))}
                        </div>

                        <p className="text-foreground/70 text-lg leading-relaxed mb-8 relative z-10 italic">
                            "{t.text}"
                        </p>

                        <div className="flex items-center gap-4 mt-auto relative z-10">
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-black text-sm shadow-lg`}>
                                {t.avatar}
                            </div>
                            <div>
                                <h4 className="font-bold text-sm tracking-tight">{t.name}</h4>
                                <p className="text-[10px] uppercase font-black tracking-widest text-foreground/30">{t.role}</p>
                            </div>
                        </div>

                        {/* Top-Right Corner Accent */}
                        <div className={`absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br ${t.color} opacity-5 rounded-full group-hover:scale-150 transition-transform duration-700`} />
                    </motion.div>
                ))}
            </div>
        </div>
    </section>
);

export default Testimonials;
