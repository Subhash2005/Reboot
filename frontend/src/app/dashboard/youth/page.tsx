"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Plus, Users, ArrowRight, Search, Trash2, Check, X, Bell } from 'lucide-react';
import axios from 'axios';

const YouthDashboard = () => {
    const [startups, setStartups] = useState([]);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedStartup, setSelectedStartup] = useState<any>(null);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);
    const [membershipStatus, setMembershipStatus] = useState<any>({ inTeam: false });
    const [newStartup, setNewStartup] = useState({
        team_name: '',
        project_name: '',
        required_skill: '',
        vacancy_count: 1,
        allow_public_join: true
    });

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(storedUser);
        fetchProfile();
        fetchStartups();
        fetchPendingRequests();
        fetchMembershipStatus();
    }, []);

    const fetchMembershipStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const res = await axios.get('http://localhost:5000/api/user/startup-status', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMembershipStatus(res.data);
        } catch (error) {
            console.error('Failed to fetch status');
        }
    };

    const fetchPendingRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const res = await axios.get('http://localhost:5000/api/startup/requests/pending', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPendingRequests(res.data);
        } catch (error) {
            console.error('Failed to fetch requests');
        }
    };

    const fetchProfile = async () => {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (!storedUser.id) return;
        try {
            const res = await axios.get(`http://localhost:5000/api/profile/${storedUser.id}`);
            setProfile(res.data);
        } catch (error) {
            console.error('Failed to fetch profile skills');
        }
    };

    const fetchStartups = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/startups');
            setStartups(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/startup/create', newStartup, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowCreateModal(false);
            fetchStartups();
            fetchMembershipStatus();
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.message || 'Creation failed');
        }
    };

    const handleJoin = async (id: number) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/startup/join', { startupId: id }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Join request sent');
            fetchMembershipStatus();
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.message || 'Join failed');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this startup? This action cannot be undone.')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/startup/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Startup deleted successfully');
            fetchStartups();
            fetchMembershipStatus();
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.message || 'Deletion failed');
        }
    };

    const handleProcessRequest = async (requestId: number, status: 'approved' | 'rejected') => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/startup/request/process',
                { requestId, status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchPendingRequests();
            fetchStartups();
            fetchMembershipStatus();
            if (selectedStartup) handleViewStartup(selectedStartup.id);
        } catch (error) {
            console.error(error);
            alert('Failed to process request');
        }
    };

    const handleRemoveMember = async (targetUserId: number) => {
        if (!confirm('Are you sure you want to remove this member?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/startup/member/remove',
                { startupId: selectedStartup.id, targetUserId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            handleViewStartup(selectedStartup.id);
            fetchStartups();
            alert('Member removed successfully');
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.message || 'Failed to remove member');
        }
    };

    const handleViewStartup = async (id: number) => {
        setLoadingMembers(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/startup/${id}`);
            setSelectedStartup(res.data);
        } catch (error) {
            console.error(error);
            alert('Could not fetch startup details');
        } finally {
            setLoadingMembers(false);
        }
    };

    const getFilteredStartups = () => {
        const userSkills = profile?.skill_name
            ? profile.skill_name.toLowerCase().split(',').map((s: string) => s.trim())
            : [];

        return startups.filter((s: any) => {
            // Rule 1: Always show 'My Team' (Founder or Member) even if full
            const isMyTeam = user?.id === s.created_by || s.id === membershipStatus?.startup_id;

            if (isMyTeam) return true;

            // Rule 2: Hide other full startups
            if (s.vacancy_count <= 0) return false;

            const normalizedSkill = (s.required_skill || '').toLowerCase();

            // Rule 3: Search filter
            if (searchTerm.trim() !== '') {
                return (
                    s.team_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    s.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    normalizedSkill.includes(searchTerm.toLowerCase())
                );
            }

            // Rule 4: Match skills or owned startups
            if (userSkills.length > 0) {
                return userSkills.some((skill: string) => normalizedSkill.includes(skill));
            }

            // Default: Show nothing else if no skills/search, only 'My Team' (already handled above)
            return false;
        });
    };

    const filteredStartups = getFilteredStartups();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-1">Startup Hub</h1>
                    <p className="text-foreground/40 text-sm">Join existing teams or launch your own venture.</p>
                </div>

                {pendingRequests.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex-1 max-w-md bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-primary rounded-xl">
                                <Bell className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-white">New Join Request</p>
                                <p className="text-[10px] text-primary uppercase font-black">{pendingRequests[0].username} wants to join {pendingRequests[0].project_name}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => handleProcessRequest(pendingRequests[0].id, 'approved')}
                                className="p-2 bg-green-500 rounded-lg hover:scale-110 transition-transform shadow-lg shadow-green-500/20"
                            >
                                <Check className="w-4 h-4 text-white" />
                            </button>
                            <button
                                onClick={() => handleProcessRequest(pendingRequests[0].id, 'rejected')}
                                className="p-2 bg-rose-500 rounded-lg hover:scale-110 transition-transform shadow-lg shadow-rose-500/20"
                            >
                                <X className="w-4 h-4 text-white" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {!membershipStatus.inTeam && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center space-x-2 bg-primary text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Create Startup</span>
                    </button>
                )}
                {membershipStatus.inTeam && (
                    <div className="flex items-center space-x-3 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <div>
                            <p className="text-[10px] text-foreground/40 uppercase font-black tracking-widest leading-none mb-1">Active Team</p>
                            <p className="text-sm font-bold text-white leading-none">{membershipStatus.project_name}</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="relative max-w-2xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/30" />
                <input
                    type="text"
                    placeholder="Search by team, project, or skill..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary transition-all shadow-xl"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStartups.length === 0 ? (
                    <div className="col-span-full py-20 text-center glass rounded-[2.5rem] border border-white/5">
                        <Rocket className="w-12 h-12 text-foreground/10 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No Matching Startups</h3>
                        <p className="text-foreground/40 text-sm max-w-xs mx-auto">
                            {!profile?.skill_name
                                ? "Please update your skills in your profile to see tailored startup opportunities."
                                : "No startups currently match your skills or search criteria."}
                        </p>
                    </div>
                ) : (
                    filteredStartups.map((s: any) => (
                        <motion.div
                            key={s.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ y: -10 }}
                            onClick={() => handleViewStartup(s.id)}
                            className="glass-card p-8 flex flex-col h-full border-t-4 border-t-primary relative cursor-pointer hover:border-primary/50 transition-all"
                        >
                            {user?.id === s.created_by && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(s.id);
                                    }}
                                    className="absolute top-4 right-4 p-2 text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all z-10"
                                    title="Delete Startup"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                            <div className="flex items-center justify-between mb-6">
                                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                    <Rocket className="w-6 h-6" />
                                </div>
                                <div className="flex items-center space-x-2 text-xs font-bold text-foreground/40 bg-white/5 px-3 py-1.5 rounded-full">
                                    <Users className="w-3.5 h-3.5" />
                                    <span>{s.vacancy_count} Openings</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold mb-2">{s.project_name}</h3>
                            <p className="text-xs text-primary font-bold uppercase tracking-widest mb-4 inline-block">{s.team_name}</p>
                            <p className="text-sm text-foreground/50 mb-8 line-clamp-3">
                                Seeking talented individuals with skills in <span className="text-foreground/80 font-medium">#{s.required_skill}</span> to join our innovative journey.
                            </p>
                            <div className="mt-auto flex items-center justify-between">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-[#050b18] bg-white/10 flex items-center justify-center text-[10px] font-bold">
                                            JD
                                        </div>
                                    ))}
                                </div>
                                {!membershipStatus.inTeam && user?.id !== s.created_by && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleJoin(s.id);
                                        }}
                                        className="flex items-center space-x-2 text-primary hover:text-white group transition-colors font-bold text-sm"
                                    >
                                        <span>Join Team</span>
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                )}
                                {(membershipStatus.inTeam || user?.id === s.created_by) && (
                                    <span className="text-xs font-bold text-primary/40 uppercase tracking-tighter">
                                        {user?.id === s.created_by ? 'Your Venture' : 'In a Team'}
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {showCreateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass w-full max-w-lg p-10 rounded-[2.5rem] border border-white/10">
                        <h2 className="text-2xl font-bold mb-8">Launch New Startup</h2>
                        <form onSubmit={handleCreate} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    placeholder="Team Name" required className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-primary"
                                    onChange={e => setNewStartup({ ...newStartup, team_name: e.target.value })}
                                />
                                <input
                                    placeholder="Project Name" required className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-primary"
                                    onChange={e => setNewStartup({ ...newStartup, project_name: e.target.value })}
                                />
                            </div>
                            <input
                                placeholder="Required Skills (e.g. React, UI Design)" required className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-primary"
                                onChange={e => setNewStartup({ ...newStartup, required_skill: e.target.value })}
                            />
                            <div className="flex items-center justify-between px-2">
                                <label className="text-sm font-medium">Vacancies</label>
                                <input
                                    type="number" defaultValue={1} className="w-20 bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-center"
                                    onChange={e => setNewStartup({ ...newStartup, vacancy_count: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-3 text-sm font-bold border border-white/10 rounded-xl hover:bg-white/5 transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 py-3 text-sm font-bold bg-primary rounded-xl text-white shadow-lg shadow-primary/20">Launch Rocket</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {selectedStartup && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="glass w-full max-w-2xl p-8 md:p-10 rounded-[2.5rem] border border-white/10 relative max-h-[90vh] overflow-y-auto"
                    >
                        <button
                            onClick={() => setSelectedStartup(null)}
                            className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <Plus className="w-6 h-6 rotate-45 text-foreground/40" />
                        </button>

                        <div className="space-y-8">
                            <div className="flex items-center space-x-4">
                                <div className="p-4 bg-primary/10 rounded-2xl text-primary">
                                    <Rocket className="w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold">{selectedStartup.project_name}</h2>
                                    <p className="text-sm text-primary font-bold uppercase tracking-widest">{selectedStartup.team_name}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 py-6 border-y border-white/5">
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest font-black text-foreground/30">Founder</label>
                                    <p className="font-bold text-white">{selectedStartup.creator_name || 'Visionary Leader'}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest font-black text-foreground/30">Open Vacancies</label>
                                    <p className="font-bold text-green-400">{selectedStartup.vacancy_count} Spots</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-bold flex items-center space-x-2">
                                    <Users className="w-5 h-5 text-primary" />
                                    <span>Team Members</span>
                                </h3>
                                <div className="space-y-3">
                                    {selectedStartup.members?.map((member: any) => (
                                        <div key={member.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center font-bold text-primary">
                                                    {member.username[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white uppercase text-xs">{member.username}</p>
                                                    <p className="text-xs text-foreground/40">
                                                        {member.role === 'leader' || member.role === 'Founder' ? 'Founder' : member.role}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <div className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                    Active
                                                </div>
                                                {user?.id === selectedStartup.created_by && member.user_id !== user.id && (
                                                    <button
                                                        onClick={() => handleRemoveMember(member.user_id)}
                                                        className="p-1 px-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-lg text-[10px] font-bold uppercase hover:bg-rose-500 hover:text-white transition-all"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4">
                                {!membershipStatus.inTeam && user?.id !== selectedStartup.created_by && (
                                    <button
                                        onClick={() => {
                                            handleJoin(selectedStartup.id);
                                            setSelectedStartup(null);
                                        }}
                                        className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:scale-[1.02] transition-transform shadow-xl shadow-primary/20"
                                    >
                                        Apply to Join Team
                                    </button>
                                )}
                                {membershipStatus.inTeam && user?.id !== selectedStartup.created_by && (
                                    <p className="text-center py-4 text-xs font-bold text-foreground/30 uppercase tracking-widest border border-white/5 rounded-2xl">
                                        You are already in a team
                                    </p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default YouthDashboard;
