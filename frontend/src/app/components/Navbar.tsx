"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, User, LogIn, Mail } from 'lucide-react';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between glass px-6 py-3 rounded-2xl border border-white/10">
                <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    REBOOT
                </Link>

                <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
                    <Link href="#about" className="hover:text-primary transition-colors">About</Link>
                    <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
                    <Link href="#how-it-works" className="hover:text-primary transition-colors">How It Works</Link>
                    <Link href="#products" className="hover:text-primary transition-colors">Our Products</Link>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center space-x-2 bg-primary/20 hover:bg-primary/30 text-primary px-4 py-2 rounded-xl transition-all border border-primary/30"
                    >
                        <span>Join</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 mt-3 w-56 glass border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                            >
                                <div className="p-2 space-y-1">
                                    <Link href="/register" className="flex items-center space-x-3 p-3 hover:bg-white/5 rounded-xl transition-colors">
                                        <User className="w-4 h-4 text-accent" />
                                        <span>Register</span>
                                    </Link>
                                    <Link href="/login" className="flex items-center space-x-3 p-3 hover:bg-white/5 rounded-xl transition-colors">
                                        <LogIn className="w-4 h-4 text-primary" />
                                        <span>Login</span>
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
