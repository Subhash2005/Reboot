import React from 'react';
import Link from 'next/link';
import { Github, Twitter, Linkedin, Instagram, Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
    const links = {
        Platform: [
            { label: 'Professionals', href: '/dashboard/professional' },
            { label: 'Freelancers', href: '/dashboard/freelancer' },
            { label: 'Youth & Startups', href: '/dashboard/youth' },
            { label: 'Non-Technical', href: '/dashboard/non-tech' },
            { label: 'Part-Time', href: '/dashboard/part-time' },
        ],
        Company: [
            { label: 'About Us', href: '#about' },
            { label: 'How It Works', href: '#how-it-works' },
            { label: 'Features', href: '#features' },
            { label: 'Careers', href: '#' },
            { label: 'Blog', href: '#' },
        ],
        Support: [
            { label: 'Help Center', href: '#' },
            { label: 'Privacy Policy', href: '#' },
            { label: 'Terms of Service', href: '#' },
            { label: 'Contact Us', href: '#' },
            { label: 'Report a Bug', href: '#' },
        ],
    };

    const socials = [
        { icon: <Github className="w-4 h-4" />, href: '#', label: 'GitHub' },
        { icon: <Twitter className="w-4 h-4" />, href: '#', label: 'Twitter' },
        { icon: <Linkedin className="w-4 h-4" />, href: '#', label: 'LinkedIn' },
        { icon: <Instagram className="w-4 h-4" />, href: '#', label: 'Instagram' },
    ];

    return (
        <footer className="relative mt-8 border-t border-white/10 bg-black/30 backdrop-blur-xl overflow-hidden">
            {/* Top glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

            <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
                {/* Main Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
                    {/* Brand */}
                    <div className="lg:col-span-2 space-y-6">
                        <Link href="/" className="inline-block text-3xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-tight">
                            REBOOT
                        </Link>
                        <p className="text-sm text-foreground/50 leading-relaxed max-w-xs">
                            The ultimate income revival platform. A modular SaaS ecosystem designed for professionals, freelancers, youth, and everyone in between.
                        </p>
                        {/* Contact info */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm text-foreground/40">
                                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                                <span>hello@rebootplatform.in</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-foreground/40">
                                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                                <span>+91 98765 43210</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-foreground/40">
                                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                                <span>Bangalore, Karnataka, India</span>
                            </div>
                        </div>
                        {/* Socials */}
                        <div className="flex items-center gap-3">
                            {socials.map((s) => (
                                <Link key={s.label} href={s.href} aria-label={s.label}
                                    className="w-9 h-9 rounded-xl glass border border-white/10 flex items-center justify-center text-foreground/40 hover:text-primary hover:border-primary/30 transition-all hover:scale-110">
                                    {s.icon}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Link columns */}
                    {Object.entries(links).map(([heading, items]) => (
                        <div key={heading}>
                            <h4 className="font-bold text-sm uppercase tracking-widest text-foreground/80 mb-5">{heading}</h4>
                            <ul className="space-y-3">
                                {items.map((item) => (
                                    <li key={item.label}>
                                        <Link href={item.href}
                                            className="text-sm text-foreground/40 hover:text-primary transition-colors duration-200 flex items-center gap-1.5 group">
                                            <span className="w-0 group-hover:w-2 h-px bg-primary transition-all duration-200 flex-shrink-0" />
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Newsletter */}
                <div className="glass rounded-2xl p-6 mb-10 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <p className="font-bold mb-1">Stay in the loop</p>
                        <p className="text-sm text-foreground/40">Get weekly job alerts, platform updates, and career tips.</p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="flex-1 md:w-64 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-all"
                        />
                        <button className="bg-primary hover:bg-primary/90 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-primary/20 whitespace-nowrap hover:scale-105">
                            Subscribe
                        </button>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-foreground/30">
                        © 2026 Reboot Platform Pvt. Ltd. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        {['Privacy', 'Terms', 'Cookies'].map((item) => (
                            <Link key={item} href="#" className="text-xs text-foreground/30 hover:text-primary transition-colors">
                                {item}
                            </Link>
                        ))}
                    </div>
                    <p className="text-xs text-foreground/20">
                        Made with ❤️ in India
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
