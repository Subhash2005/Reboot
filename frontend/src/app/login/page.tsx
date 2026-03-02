"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import GoogleAuthButton from '@/components/GoogleAuthButton';

const LoginPage = () => {
    const router = useRouter();
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const res = await axios.post('http://localhost:5000/api/login', credentials);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            router.push('/categories');
        } catch (error: any) {
            console.error(error);
            setError(error.response?.data?.message || 'Login failed. Please check your connection.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass w-full max-w-md p-8 rounded-3xl border border-white/10"
            >
                <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Welcome Back
                </h2>

                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold p-3 rounded-xl mb-6 text-center"
                    >
                        {error}
                    </motion.p>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                        <input
                            type="text" placeholder="Username" required
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary transition-colors"
                            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                        <input
                            type={showPassword ? "text" : "password"} placeholder="Password" required
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-12 focus:outline-none focus:border-primary transition-colors"
                            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-primary transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>

                    <div className="text-right">
                        <Link href="/forgot-password" className="text-sm text-foreground/40 hover:text-primary transition-colors">
                            Forgot Password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-primary/20"
                    >
                        Login
                    </button>
                </form>

                <GoogleAuthButton />

                <p className="text-center mt-8 text-sm text-foreground/60">
                    Don&apos;t have an account? <Link href="/register" className="text-primary hover:underline">Register</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default LoginPage;
