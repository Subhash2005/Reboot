"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, Mail, Lock, Briefcase, Camera, Save, Plus, Trash2, X, Bell, Grid, Image as ImageIcon, Search, UserPlus, Check, Bookmark, Compass } from 'lucide-react';
import axios from 'axios';

const ProfilePage = () => {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [tempSkill, setTempSkill] = useState('');
    const [experience, setExperience] = useState<any[]>([]);

    // Modal State
    const [modalType, setModalType] = useState<null | 'followers' | 'following' | 'notifications'>(null);
    const [modalData, setModalData] = useState<any[]>([]);
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Posts State
    const [activeTab, setActiveTab] = useState<'my_posts' | 'feed' | 'saved'>('my_posts');
    const [myPosts, setMyPosts] = useState<any[]>([]);
    const [feedPosts, setFeedPosts] = useState<any[]>([]);
    const [savedPosts, setSavedPosts] = useState<any[]>([]);
    const [isPosting, setIsPosting] = useState(false);
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostImage, setNewPostImage] = useState<File | null>(null);
    const [newPostPreview, setNewPostPreview] = useState<string | null>(null);

    const fetchPosts = async () => {
        try {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const myRes = await axios.get(`http://localhost:5000/api/posts/user/${user.id}`, { headers: { Authorization: `Bearer ${token}` } });
            setMyPosts(myRes.data);

            const feedRes = await axios.get(`http://localhost:5000/api/posts/feed`, { headers: { Authorization: `Bearer ${token}` } });
            setFeedPosts(feedRes.data);

            const savedRes = await axios.get(`http://localhost:5000/api/posts/saved`, { headers: { Authorization: `Bearer ${token}` } });
            setSavedPosts(savedRes.data);
        } catch (error) {
            console.error(error);
        }
    };

    // Search effect
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }
        const delay = setTimeout(async () => {
            setIsSearching(true);
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`http://localhost:5000/api/search?query=${searchQuery}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSearchResults(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                setIsSearching(false);
            }
        }, 500);
        return () => clearTimeout(delay);
    }, [searchQuery]);

    const fetchModalData = async (type: 'followers' | 'following' | 'notifications') => {
        try {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            let res;
            if (type === 'followers') {
                res = await axios.get(`http://localhost:5000/api/followers?userId=${user.id}`, { headers: { Authorization: `Bearer ${token}` } });
            } else if (type === 'following') {
                res = await axios.get(`http://localhost:5000/api/following?userId=${user.id}`, { headers: { Authorization: `Bearer ${token}` } });
            } else if (type === 'notifications') {
                res = await axios.get(`http://localhost:5000/api/notifications`, { headers: { Authorization: `Bearer ${token}` } });
                const reqRes = await axios.get(`http://localhost:5000/api/requests`, { headers: { Authorization: `Bearer ${token}` } });
                setPendingRequests(reqRes.data || []);

                // Mark all as read when opening notifications
                await axios.put(`http://localhost:5000/api/notifications/read/all`, {}, { headers: { Authorization: `Bearer ${token}` } });
                // Update local profile stats
                setProfile((prev: any) => ({ ...prev, stats: { ...prev.stats, unreadNotifications: 0 } }));
            }
            setModalData(res?.data || []);
            setModalType(type);
        } catch (error) {
            console.error(error);
        }
    };

    const handleFollow = async (userId: number) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/follow', { followingId: userId }, { headers: { Authorization: `Bearer ${token}` } });

            // Optimistic update for search results
            setSearchResults(prev => prev.map(u => u.id === userId ? { ...u, follow_status: 'pending' } : u));
        } catch (error) {
            console.error(error);
        }
    };

    const handleAcceptRequest = async (followerId: number) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/follow/accept', { followerId }, { headers: { Authorization: `Bearer ${token}` } });
            // Refresh local data
            setPendingRequests(prev => prev.filter(r => r.follower_id !== followerId));
            setProfile((prev: any) => ({ ...prev, stats: { ...prev.stats, followers: (prev.stats?.followers || 0) + 1 } }));
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                const res = await axios.get(`http://localhost:5000/api/profile/${user.id}`);
                setProfile(res.data);

                // Parse experience if it exists
                if (res.data.previous_experience) {
                    try {
                        setExperience(JSON.parse(res.data.previous_experience));
                    } catch (e) {
                        setExperience([]);
                    }
                }
                setLoading(false);
            } catch (error) {
                console.error(error);
            }
        };
        fetchProfile();
        fetchPosts();
    }, []);

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('content', newPostContent);
            if (newPostImage) formData.append('media', newPostImage);

            await axios.post('http://localhost:5000/api/posts/create', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setIsPosting(false);
            setNewPostContent('');
            setNewPostImage(null);
            setNewPostPreview(null);
            fetchPosts(); // Refresh posts

            // update profile post count optimistically
            setProfile((prev: any) => ({ ...prev, stats: { ...prev.stats, posts: (prev.stats?.posts || 0) + 1 } }));
        } catch (error) {
            console.error(error);
            alert("Failed to create post");
        }
    };

    const handleSavePost = async (postId: number) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/posts/${postId}/save`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchPosts(); // Quick way to sync lists and UI states
        } catch (error) {
            console.error(error);
        }
    };

    const handlePostImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setNewPostImage(file);
            setNewPostPreview(URL.createObjectURL(file));
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const dataToUpdate = {
                ...profile,
                previous_experience: JSON.stringify(experience)
            };
            await axios.put('http://localhost:5000/api/profile/update', dataToUpdate, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Profile Updated Successfully');
        } catch (error) {
            console.error(error);
            alert('Update failed');
        }
    };

    const addExperience = () => {
        setExperience([...experience, { company: '', role: '', from: '', to: '' }]);
    };

    const removeExperience = (index: number) => {
        const newExp = [...experience];
        newExp.splice(index, 1);
        setExperience(newExp);
    };

    const updateExperience = (index: number, field: string, value: string) => {
        const newExp = [...experience];
        newExp[index][field] = value;
        setExperience(newExp);
    };

    const insertSkill = () => {
        if (!tempSkill.trim()) return;
        const currentSkills = profile.skill_name ? profile.skill_name + ', ' + tempSkill : tempSkill;
        setProfile({ ...profile, skill_name: currentSkills });
        setTempSkill('');
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/profile/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            setProfile({ ...profile, profile_picture: res.data.imageUrl });
        } catch (error) {
            console.error(error);
            alert('Image upload failed');
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-white text-xl">Loading...</div>;

    return (
        <div className="min-h-screen pt-24 md:pt-32 pb-20 px-4 md:px-6">
            <div className="max-w-4xl mx-auto glass p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-white/10">
                <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-12 mb-12 relative">
                    {/* Notification Symbol like Insta */}
                    <div className="absolute top-0 right-0">
                        <button
                            onClick={() => fetchModalData('notifications')}
                            className="relative p-2 rounded-full hover:bg-white/5 transition-colors border border-white/5"
                        >
                            <Bell className="w-7 h-7 text-white" />
                            {profile?.stats?.unreadNotifications > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-3 h-3 bg-rose-500 rounded-full border-2 border-[#121826]" />
                            )}
                        </button>
                    </div>

                    <div className="relative group">
                        <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-primary/20 shadow-2xl relative">
                            {profile.profile_picture ? (
                                <img src={profile.profile_picture} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                                    <User className="w-16 h-16 text-primary/40" />
                                </div>
                            )}
                        </div>
                        <input
                            type="file"
                            id="profile-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                        <button
                            type="button"
                            onClick={() => document.getElementById('profile-upload')?.click()}
                            className="absolute bottom-2 right-2 p-3 bg-primary rounded-full border-4 border-[#121826] group-hover:scale-110 transition-transform shadow-xl"
                        >
                            <Camera className="w-5 h-5 text-white" />
                        </button>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center md:space-x-6 mb-6">
                            <h1 className="text-4xl font-black tracking-tight text-white italic uppercase">{profile.full_name || profile.username}</h1>
                            <div className="flex items-center justify-center md:justify-start space-x-2 mt-2 md:mt-0">
                                <span className="px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-xs font-bold text-foreground/40 italic lowercase">@{profile.username}</span>
                            </div>
                        </div>

                        {/* Stats - Like Instagram */}
                        <div className="flex items-center justify-center md:justify-start space-x-12 mb-2">
                            <div
                                onClick={() => {
                                    document.getElementById('posts-grid')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="flex flex-col md:flex-row items-center md:space-x-2 cursor-pointer hover:opacity-75 transition-opacity"
                            >
                                <span className="text-xl font-black text-white">{profile?.stats?.posts || 0}</span>
                                <span className="text-xs font-bold uppercase tracking-widest text-foreground/40">Posts</span>
                            </div>
                            <div
                                onClick={() => fetchModalData('followers')}
                                className="flex flex-col md:flex-row items-center md:space-x-2 cursor-pointer hover:opacity-75 transition-opacity"
                            >
                                <span className="text-xl font-black text-white">{profile?.stats?.followers || 0}</span>
                                <span className="text-xs font-bold uppercase tracking-widest text-foreground/40">Followers</span>
                            </div>
                            <div
                                onClick={() => fetchModalData('following')}
                                className="flex flex-col md:flex-row items-center md:space-x-2 cursor-pointer hover:opacity-75 transition-opacity"
                            >
                                <span className="text-xl font-black text-white">{profile?.stats?.following || 0}</span>
                                <span className="text-xs font-bold uppercase tracking-widest text-foreground/40">Following</span>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleUpdate} className="space-y-10">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground/60 ml-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                                <input
                                    type="text"
                                    value={profile.full_name ?? ''}
                                    placeholder="Enter your name"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-primary transition-all text-white"
                                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground/60 ml-1">Username {profile.auth_provider !== 'google' && '(Read-only)'}</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                                <input
                                    type="text"
                                    value={profile.username ?? ''}
                                    className={`w-full border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 transition-all text-white ${profile.auth_provider === 'google' ? 'bg-white/5 focus:border-primary' : 'bg-white/10 text-foreground/40 cursor-not-allowed'}`}
                                    readOnly={profile.auth_provider !== 'google'}
                                    onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground/60 ml-1">Phone Number {profile.auth_provider !== 'google' && '(Read-only)'}</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                                <input
                                    type="text"
                                    value={profile.phone ?? ''}
                                    className={`w-full border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 transition-all text-white ${profile.auth_provider === 'google' ? 'bg-white/5 focus:border-primary' : 'bg-white/10 text-foreground/40 cursor-not-allowed'}`}
                                    readOnly={profile.auth_provider !== 'google'}
                                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground/60 ml-1">Email Address (Read-only)</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                                <input
                                    type="email" value={profile.email ?? ''}
                                    className="w-full bg-white/10 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-foreground/40 cursor-not-allowed"
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bio */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground/60 ml-1">Bio</label>
                        <textarea
                            value={profile.bio ?? ''}
                            placeholder="Tell us about yourself..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 h-24 focus:outline-none focus:border-primary transition-all resize-none text-white"
                            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        />
                    </div>

                    {/* Skills Section */}
                    <div className="space-y-6 bg-white/5 p-6 rounded-3xl border border-white/5">
                        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                            <Briefcase className="w-5 h-5 text-primary" />
                            <span>Skills</span>
                        </h2>

                        <div className="space-y-4">
                            <p className="text-sm font-medium text-foreground/60">Skill Category</p>
                            <div className="flex space-x-8">
                                <label className="flex items-center space-x-3 cursor-pointer group">
                                    <input
                                        type="radio" name="skill_type" value="tech" checked={profile.skill_type === 'tech'}
                                        onChange={() => setProfile({ ...profile, skill_type: 'tech' })}
                                        className="w-5 h-5 accent-primary"
                                    />
                                    <span className="text-white group-hover:text-primary transition-colors">Technology</span>
                                </label>
                                <label className="flex items-center space-x-3 cursor-pointer group">
                                    <input
                                        type="radio" name="skill_type" value="non-tech" checked={profile.skill_type === 'non-tech'}
                                        onChange={() => setProfile({ ...profile, skill_type: 'non-tech' })}
                                        className="w-5 h-5 accent-primary"
                                    />
                                    <span className="text-white group-hover:text-primary transition-colors">Non-Technical</span>
                                </label>
                            </div>
                        </div>

                        {profile.skill_type && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="text-sm font-medium text-foreground/60">
                                    Enter {profile.skill_type === 'tech' ? 'Technical' : 'Non-Technical'} Skills
                                </label>
                                <div className="flex space-x-4">
                                    <input
                                        type="text"
                                        value={tempSkill}
                                        placeholder={`e.g. ${profile.skill_type === 'tech' ? 'React, Python, AWS' : 'Public Speaking, Leadership'}`}
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-primary transition-all text-white"
                                        onChange={(e) => setTempSkill(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), insertSkill())}
                                    />
                                    <button
                                        type="button"
                                        onClick={insertSkill}
                                        className="px-6 bg-primary/20 text-primary hover:bg-primary hover:text-white font-medium rounded-xl transition-all border border-primary/30"
                                    >
                                        Insert
                                    </button>
                                </div>
                                <div className="p-4 bg-background/50 rounded-2xl border border-white/5 min-h-[100px]">
                                    <p className="text-xs text-foreground/40 mb-2 uppercase tracking-tighter">Your Added Skills:</p>
                                    <div className="flex wrap gap-2">
                                        {profile.skill_name ? profile.skill_name.split(',').map((s: string, i: number) => (
                                            <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm border border-primary/20">
                                                {s.trim()}
                                            </span>
                                        )) : <span className="text-foreground/20 italic text-sm">No skills added yet</span>}
                                    </div>
                                    {profile.skill_name && (
                                        <button
                                            type="button"
                                            onClick={() => setProfile({ ...profile, skill_name: '' })}
                                            className="mt-4 text-xs text-red-400 hover:text-red-300 transition-colors"
                                        >
                                            Clear All Skills
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Job Experience Section */}
                    <div className="space-y-6 bg-white/5 p-6 rounded-3xl border border-white/5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                                <Briefcase className="w-5 h-5 text-accent" />
                                <span>Previous Job Experience</span>
                            </h2>
                            <button
                                type="button"
                                onClick={addExperience}
                                className="flex items-center space-x-2 px-4 py-2 bg-accent/20 text-accent hover:bg-accent hover:text-white rounded-xl transition-all text-sm font-medium border border-accent/30"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Add Experience</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {experience.length === 0 ? (
                                <div className="text-center py-8 border-2 border-dashed border-white/5 rounded-2xl">
                                    <p className="text-foreground/30 text-sm italic">No experience added yet. Click "+ Add Experience" to begin.</p>
                                </div>
                            ) : (
                                experience.map((exp, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 bg-white/5 rounded-2xl border border-white/5 relative group">
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase text-foreground/40 ml-1 font-bold">Company</label>
                                            <input
                                                type="text" value={exp.company}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-accent text-white"
                                                onChange={(e) => updateExperience(index, 'company', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase text-foreground/40 ml-1 font-bold">Role</label>
                                            <input
                                                type="text" value={exp.role}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-accent text-white"
                                                onChange={(e) => updateExperience(index, 'role', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase text-foreground/40 ml-1 font-bold">From</label>
                                            <input
                                                type="text" value={exp.from} placeholder="MM/YY"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-accent text-white"
                                                onChange={(e) => updateExperience(index, 'from', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase text-foreground/40 ml-1 font-bold">To</label>
                                            <div className="flex space-x-2">
                                                <input
                                                    type="text" value={exp.to} placeholder="MM/YY or Present"
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-accent text-white"
                                                    onChange={(e) => updateExperience(index, 'to', e.target.value)}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeExperience(index)}
                                                    className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            className="flex items-center justify-center space-x-3 w-full px-8 bg-primary hover:bg-primary/90 text-white font-bold py-5 rounded-2xl transition-all shadow-2xl shadow-primary/30 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] hover:bg-right duration-500 uppercase tracking-widest text-sm"
                        >
                            <Save className="w-5 h-5 text-white" />
                            <span>Update Profile</span>
                        </button>
                    </div>
                </form>

                {/* Posts Grid Section - Like Instagram */}
                <div id="posts-grid" className="mt-20 pt-12 border-t border-white/5">
                    <div className="flex items-center justify-center space-x-12 mb-12">
                        <button
                            onClick={() => setActiveTab('my_posts')}
                            className={`flex items-center space-x-2 pb-4 border-b-2 font-black uppercase text-xs tracking-[0.2em] italic transition-colors ${activeTab === 'my_posts' ? 'border-primary text-primary' : 'border-transparent text-foreground/40 hover:text-white'}`}
                        >
                            <Grid className="w-4 h-4" />
                            <span>My Posts</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('feed')}
                            className={`flex items-center space-x-2 pb-4 border-b-2 font-black uppercase text-xs tracking-[0.2em] italic transition-colors ${activeTab === 'feed' ? 'border-primary text-primary' : 'border-transparent text-foreground/40 hover:text-white'}`}
                        >
                            <Compass className="w-4 h-4" />
                            <span>Feed</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('saved')}
                            className={`flex items-center space-x-2 pb-4 border-b-2 font-black uppercase text-xs tracking-[0.2em] italic transition-colors ${activeTab === 'saved' ? 'border-primary text-primary' : 'border-transparent text-foreground/40 hover:text-white'}`}
                        >
                            <Bookmark className="w-4 h-4" />
                            <span>Saved</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {activeTab === 'my_posts' && (
                            <>
                                <div onClick={() => setIsPosting(true)} className="aspect-square bg-white/5 rounded-xl border border-white/5 flex flex-col items-center justify-center group overflow-hidden relative cursor-pointer hover:border-primary/50 transition-colors">
                                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                                        <Plus className="w-8 h-8 text-white scale-75 group-hover:scale-100 transition-transform" />
                                    </div>
                                    <Plus className="w-8 h-8 text-foreground/10 group-hover:scale-110 group-hover:text-primary transition-all duration-500 mb-2" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 group-hover:text-primary transition-colors">Add Post</p>
                                </div>
                                {myPosts.map(post => (
                                    <div key={`my-${post.id}`} className="aspect-square bg-white/5 rounded-xl border border-white/5 flex flex-col items-center justify-center overflow-hidden relative group">
                                        {post.media_url ? (
                                            <img src={post.media_url} className="absolute inset-0 w-full h-full object-cover" />
                                        ) : (
                                            <div className="p-6 text-center z-10">
                                                <p className="font-bold text-white text-lg">{post.title}</p>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                            <p className="text-sm font-medium text-white line-clamp-2">{post.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}

                        {(activeTab === 'feed' || activeTab === 'saved') && (
                            (activeTab === 'feed' ? feedPosts : savedPosts).map(post => (
                                <div key={`feed-saved-${post.id}`} className="aspect-square bg-white/5 rounded-xl border border-white/5 flex flex-col overflow-hidden relative group">
                                    {post.media_url ? (
                                        <img src={post.media_url} className="absolute inset-0 w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-white/5 to-transparent">
                                            {post.title !== 'My Post' && <p className="font-bold text-white text-lg text-center">{post.title}</p>}
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-8 h-8 rounded-full bg-primary/20 overflow-hidden border border-primary/30">
                                                    {post.profile_picture ? <img src={post.profile_picture} className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-primary m-2" />}
                                                </div>
                                                <span className="text-xs font-bold text-white shadow-black drop-shadow-md">@{post.username}</span>
                                            </div>
                                            <button onClick={() => handleSavePost(post.id)} className="p-2 bg-black/40 hover:bg-black/80 rounded-full transition-colors backdrop-blur-sm z-20">
                                                <Bookmark className={`w-4 h-4 ${post.is_saved ? 'text-primary fill-primary' : 'text-white'}`} />
                                            </button>
                                        </div>
                                        <p className="text-xs text-white/90 line-clamp-3">{post.content}</p>
                                    </div>
                                </div>
                            ))
                        )}
                        {(activeTab === 'feed' && feedPosts.length === 0) && (
                            <div className="col-span-1 md:col-span-3 text-center py-20 text-foreground/40 text-sm italic">Follow more people to see their posts here!</div>
                        )}
                        {(activeTab === 'saved' && savedPosts.length === 0) && (
                            <div className="col-span-1 md:col-span-3 text-center py-20 text-foreground/40 text-sm italic">You haven't saved any posts yet.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Interactive Modals */}
            <AnimatePresence>
                {isPosting && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-[#0a0f1d]/90 backdrop-blur-xl">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#0f172a] border border-white/10 max-w-md w-full rounded-[3rem] p-8 relative overflow-hidden shadow-2xl">
                            <div className="flex justify-between items-center mb-6 relative z-10">
                                <h2 className="text-2xl font-black italic uppercase text-white capitalize">New Post</h2>
                                <button onClick={() => { setIsPosting(false); setNewPostPreview(null); setNewPostImage(null); }} className="p-2 hover:bg-white/5 rounded-full transition-colors text-foreground/40 hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <form onSubmit={handleCreatePost} className="space-y-4 relative z-10">
                                <div className="aspect-video bg-white/5 border border-white/10 rounded-2xl overflow-hidden relative flex items-center justify-center group cursor-pointer" onClick={() => document.getElementById('post-image')?.click()}>
                                    {newPostPreview ? (
                                        <img src={newPostPreview} className="absolute inset-0 w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center group-hover:scale-110 transition-transform">
                                            <Camera className="w-8 h-8 text-primary mx-auto mb-2" />
                                            <p className="text-xs font-bold uppercase tracking-widest text-foreground/40">Upload Media</p>
                                        </div>
                                    )}
                                </div>
                                <input type="file" id="post-image" className="hidden" accept="image/*" onChange={handlePostImageChange} />
                                <textarea
                                    value={newPostContent}
                                    onChange={e => setNewPostContent(e.target.value)}
                                    placeholder="Write a caption..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-primary transition-all text-white min-h-[100px] resize-none"
                                />
                                <button type="submit" disabled={!newPostContent && !newPostImage} className="w-full py-4 bg-primary text-white font-black uppercase text-xs tracking-widest rounded-2xl hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 shadow-xl shadow-primary/20">
                                    Share Post
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}

                {modalType && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#0a0f1d]/90 backdrop-blur-xl"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-[#0f172a] border border-white/10 max-w-md w-full rounded-[3rem] p-8 relative overflow-hidden shadow-2xl max-h-[80vh] flex flex-col"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[80px]" />
                            <div className="flex justify-between items-center mb-6 relative z-10">
                                <h2 className="text-2xl font-black italic uppercase text-white capitalize">{modalType}</h2>
                                <button onClick={() => setModalType(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-foreground/40 hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {(modalType === 'followers' || modalType === 'following') && (
                                <div className="mb-6 relative z-10">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search users to follow..."
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-primary transition-all text-white text-sm"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar relative z-10">
                                {searchQuery.trim() ? (
                                    <div className="space-y-4">
                                        {isSearching ? (
                                            <div className="text-center py-8 text-primary font-bold text-sm animate-pulse">Searching...</div>
                                        ) : searchResults.length === 0 ? (
                                            <div className="text-center py-8 text-foreground/40 text-sm">No users found.</div>
                                        ) : (
                                            searchResults.map(user => (
                                                <div key={user.id} className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/30">
                                                            {user.profile_picture ? <img src={user.profile_picture} className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-primary" />}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-white text-sm tracking-tight">{user.username}</p>
                                                            <p className="text-xs font-bold uppercase tracking-widest text-foreground/40">{user.full_name}</p>
                                                        </div>
                                                    </div>
                                                    {user.follow_status === 'accepted' ? (
                                                        <button className="px-4 py-2 bg-white/10 text-white/50 text-xs font-black uppercase tracking-widest rounded-xl flex items-center space-x-2" disabled>
                                                            <Check className="w-3 h-3" />
                                                            <span>Following</span>
                                                        </button>
                                                    ) : user.follow_status === 'pending' ? (
                                                        <button className="px-4 py-2 bg-white/10 text-white/50 text-xs font-black uppercase tracking-widest rounded-xl" disabled>
                                                            Requested
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleFollow(user.id)}
                                                            className="px-4 py-2 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-transform flex items-center space-x-2"
                                                        >
                                                            <UserPlus className="w-3 h-3" />
                                                            <span>Follow</span>
                                                        </button>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        {modalType === 'notifications' && pendingRequests.length > 0 && (
                                            <div className="mb-6 space-y-4">
                                                <h3 className="text-xs font-black uppercase tracking-widest text-primary">Follow Requests</h3>
                                                {pendingRequests.map(req => (
                                                    <div key={req.id} className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5 transition-all hover:border-primary/30">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/30">
                                                                {req.profile_picture ? <img src={req.profile_picture} className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-primary" />}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-white text-sm tracking-tight">{req.username}</p>
                                                                <p className="text-xs font-bold uppercase tracking-widest text-foreground/40">{req.role}</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleAcceptRequest(req.follower_id)}
                                                            className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-white text-xs font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-transform shadow-lg shadow-primary/20"
                                                        >
                                                            Accept
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {modalType === 'notifications' && <h3 className="text-xs font-black uppercase tracking-widest text-foreground/40 mb-2">Latest Alerts</h3>}

                                        {modalData.length === 0 ? (
                                            <div className="text-center py-12 text-foreground/40 font-medium italic text-sm">Nothing to see here right now.</div>
                                        ) : (
                                            modalData.map((item, i) => (
                                                <div key={i} className="flex items-center space-x-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                                    {modalType === 'notifications' ? (
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-white/90">{item.message}</p>
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mt-2">{new Date(item.created_at).toLocaleDateString()}</p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/20">
                                                                {item.profile_picture ? <img src={item.profile_picture} className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-primary" />}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-white text-base tracking-tight">{item.username}</p>
                                                                <p className="text-xs font-bold uppercase tracking-widest text-foreground/40">{item.role}</p>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProfilePage;
