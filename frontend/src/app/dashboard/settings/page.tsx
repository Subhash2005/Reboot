"use client";
import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, Eye, EyeOff, Save, Bell } from 'lucide-react';
import axios from 'axios';

const SettingsPage = () => {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/user/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProfile(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        // Simulate save
        setTimeout(() => {
            setSaving(false);
            alert('Settings saved successfully!');
        }, 1000);
    };

    if (loading) return <div className="p-10 text-center text-foreground/40 font-medium">Loading Preferences...</div>;

    return (
        <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-foreground/40 text-sm mt-1">Manage your account preferences and security.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    {/* Profile Section */}
                    <div className="glass-card p-8 space-y-6">
                        <div className="flex items-center space-x-2 text-primary text-[10px] font-black uppercase tracking-widest border-b border-white/5 pb-4">
                            <User className="w-3 h-3" />
                            <span>Public Profile</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-foreground/60 ml-1">Username</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20" />
                                    <input
                                        type="text"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-primary transition-all"
                                        value={profile?.username || ''}
                                        readOnly
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-foreground/60 ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20" />
                                    <input
                                        type="email"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-primary transition-all"
                                        value={profile?.email || ''}
                                        disabled
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-foreground/60 ml-1">Bio</label>
                            <textarea
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 h-32 focus:outline-none focus:border-primary transition-all"
                                placeholder="Tell the community about yourself..."
                                defaultValue={profile?.bio || ''}
                            />
                        </div>
                    </div>

                    {/* Security Section */}
                    <div className="glass-card p-8 space-y-6">
                        <div className="flex items-center space-x-2 text-rose-400 text-[10px] font-black uppercase tracking-widest border-b border-white/5 pb-4">
                            <Lock className="w-3 h-3" />
                            <span>Security & Auth</span>
                        </div>

                        <button className="w-full py-4 px-6 border border-dashed border-white/10 rounded-2xl text-sm font-bold hover:bg-white/5 transition-all text-foreground/60">
                            Change Password
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass-card p-6 space-y-6">
                        <div className="flex items-center space-x-2 text-accent text-[10px] font-black uppercase tracking-widest">
                            <Bell className="w-3 h-3" />
                            <span>Notifications</span>
                        </div>
                        <div className="space-y-4">
                            {[
                                { name: 'Email Alerts', desc: 'New team requests' },
                                { name: 'Direct Messages', desc: 'Team communication' },
                                { name: 'Milestones', desc: 'Project achievements' }
                            ].map(pref => (
                                <div key={pref.name} className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-bold">{pref.name}</p>
                                        <p className="text-[10px] text-foreground/40">{pref.desc}</p>
                                    </div>
                                    <div className="w-10 h-6 bg-primary rounded-full relative p-1 cursor-pointer">
                                        <div className="w-4 h-4 bg-white rounded-full absolute right-1" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-2"
                    >
                        {saving ? (
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                <span>Save Changes</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
