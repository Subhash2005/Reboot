"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Plus, CheckCircle2,
    Clock, Rocket, Wrench, Trello,
    ChevronRight, Target, Shield,
    User, Send, ExternalLink,
    Calendar, Link as LinkIcon,
    Check, Upload, Trash2, Award, Zap, MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

const TaskTimer = ({ createdAt, status }: { createdAt: string, status: string }) => {
    const [elapsed, setElapsed] = useState('');

    useEffect(() => {
        if (status === 'completed') {
            setElapsed('Mission Accomplished');
            return;
        }

        const update = () => {
            const start = new Date(createdAt).getTime();
            const now = new Date().getTime();
            const diff = now - start;

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const mins = Math.floor((diff / (1000 * 60)) % 60);
            const secs = Math.floor((diff / 1000) % 60);

            let str = '';
            if (days > 0) str += `${days}d `;
            str += `${hours}h ${mins}m ${secs}s`;
            setElapsed(str);
        };

        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [createdAt, status]);

    return (
        <div className="flex items-center space-x-1.5 text-[9px] font-black tracking-widest text-primary/80 uppercase">
            <Clock className="w-3 h-3 animate-pulse" />
            <span>{elapsed}</span>
        </div>
    );
};

const TeamPage = () => {
    const [membershipStatus, setMembershipStatus] = useState<any>(null);
    const [tasks, setTasks] = useState<any[]>([]);
    const [milestones, setMilestones] = useState<any[]>([]);
    const [tools, setTools] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modals
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showMilestoneModal, setShowMilestoneModal] = useState(false);
    const [showProgressModal, setShowProgressModal] = useState<any>(null); // task object

    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        assignedTo: [] as string[],
        deadline: '',
        tools: [] as string[]
    });
    const [newMilestone, setNewMilestone] = useState({ title: '', description: '' });
    const [progressData, setProgressData] = useState({ percentage: 0, proofUrl: '', suggestion: '' });
    const [showMemberDropdown, setShowMemberDropdown] = useState(false);

    const fetchAll = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const headers = { Authorization: `Bearer ${token}` };

            // 1. Get Membership Status
            const statusRes = await axios.get('http://localhost:5000/api/user/startup-status', { headers });
            const status = statusRes.data;
            setMembershipStatus(status);

            if (status.inTeam && status.startup_id) {
                // 2. Get Startup Details (Members)
                const startupRes = await axios.get(`http://localhost:5000/api/startup/${status.startup_id}`, { headers });
                setMembers(startupRes.data.members || []);

                // 3. Get Tasks
                const tasksRes = await axios.get(`http://localhost:5000/api/startup/${status.startup_id}/tasks`, { headers });
                setTasks(tasksRes.data);

                // 4. Get Milestones
                const milestonesRes = await axios.get(`http://localhost:5000/api/startup/${status.startup_id}/milestones`, { headers });
                setMilestones(milestonesRes.data);
            }

            // 5. Get Global Tools
            const toolsRes = await axios.get('http://localhost:5000/api/tools', { headers });
            setTools(toolsRes.data);

        } catch (error) {
            console.error('Failed to fetch team data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const handleAssignTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/startup/tasks',
                { ...newTask, startupId: membershipStatus.startup_id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setShowTaskModal(false);
            setNewTask({ title: '', description: '', assignedTo: [], deadline: '', tools: [] });
            fetchAll();
        } catch (error) {
            alert('Failed to assign task');
        }
    };

    const handleUpdateProgress = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.patch('http://localhost:5000/api/startup/tasks/progress',
                { taskId: showProgressModal.id, ...progressData },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setShowProgressModal(null);
            setProgressData({ percentage: 0, proofUrl: '', suggestion: '' });
            fetchAll();
        } catch (error) {
            alert('Failed to update progress');
        }
    };

    const handleVerifyTask = async (taskId: number, verified: boolean, suggestion: string = '') => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch('http://localhost:5000/api/startup/tasks/verify',
                { taskId, verified, suggestion },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setShowProgressModal(null);
            fetchAll();
        } catch (error) {
            alert('Action failed');
        }
    };

    const handleAddMilestone = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/startup/milestones',
                { ...newMilestone, startupId: membershipStatus.startup_id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setShowMilestoneModal(false);
            setNewMilestone({ title: '', description: '' });
            fetchAll();
        } catch (error) {
            alert('Failed to add milestone');
        }
    };

    const handleUpdateTask = async (taskId: number, status: string) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch('http://localhost:5000/api/startup/tasks',
                { taskId, status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchAll();
        } catch (error) {
            alert('Failed to update task');
        }
    };

    const isLeader = membershipStatus?.role === 'Founder' || membershipStatus?.role === 'Captain & Co-Founder';

    if (loading) return <div className="p-10 text-center">Loading Team Ecosystem...</div>;

    if (!membershipStatus?.inTeam) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center text-center space-y-6">
                <div className="p-6 bg-white/5 rounded-[3rem] border border-white/10">
                    <Rocket className="w-16 h-16 text-primary animate-pulse" />
                </div>
                <h2 className="text-3xl font-bold">No Active Team</h2>
                <p className="text-foreground/40 max-w-sm">
                    You haven&apos;t joined any team yet. Discover startups in the hub to start your journey!
                </p>
                <Link href="/dashboard/youth" className="px-8 py-4 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                    Go to Startup Hub
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center space-x-2 text-primary font-bold text-xs uppercase tracking-[0.2em] mb-2">
                        <Shield className="w-4 h-4" />
                        <span>Team Headquarters</span>
                    </div>
                    <h1 className="text-4xl font-bold">{membershipStatus.project_name}</h1>
                    <p className="text-foreground/40 mt-1">Transforming {membershipStatus.team_name} into a market leader.</p>
                </div>
                <div className="flex items-center space-x-4">
                    {isLeader && (
                        <button
                            onClick={() => setShowTaskModal(true)}
                            className="flex items-center space-x-2 bg-primary text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Assign Task</span>
                        </button>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Task Board */}
                <section className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center space-x-2">
                            <Trello className="w-5 h-5 text-primary" />
                            <span>Task Board</span>
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/30 px-2">Active Tasks</h3>
                            {tasks.filter(t => t.status !== 'completed').length === 0 && (
                                <div className="p-8 text-center glass rounded-3xl border-dashed border-white/10 text-foreground/20 text-xs">No active tasks</div>
                            )}
                            {tasks.filter(t => t.status !== 'completed').map(task => (
                                <motion.div
                                    layout
                                    key={task.id}
                                    onClick={() => {
                                        const isAssigned = task.assigned_members?.some((m: any) => m.id === membershipStatus.user_id);
                                        if ((isAssigned || isLeader) && !task.is_verified) {
                                            setShowProgressModal(task);
                                        }
                                    }}
                                    className={`glass-card p-6 border-l-4 group relative overflow-hidden transition-all hover:translate-x-1 cursor-pointer 
                                        ${task.is_verified ? 'border-l-emerald-500 hover:shadow-emerald-500/10' : 'border-l-primary hover:shadow-primary/10'}
                                        ${!task.assigned_members?.some((m: any) => m.id === membershipStatus.user_id) && !isLeader ? 'opacity-70 grayscale-[0.5]' : ''}
                                    `}
                                >
                                    {/* Authorization Overlay for Unassigned Users */}
                                    {!task.assigned_members?.some((m: any) => m.id === membershipStatus.user_id) && !isLeader && (
                                        <div className="absolute inset-0 bg-background/20 backdrop-blur-[2px] z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="bg-background/80 px-4 py-2 rounded-full border border-white/10 flex items-center space-x-2">
                                                <Shield className="w-3 h-3 text-rose-500" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-white">Personnel Only</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Trigger Overlays */}
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                        <div className="p-2 bg-primary/20 rounded-lg text-primary">
                                            <Zap className="w-3 h-3" />
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-start mb-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <h4 className={`font-bold text-sm mb-1 group-hover:text-primary transition-colors ${task.is_verified ? 'text-emerald-400' : ''}`}>{task.title}</h4>
                                                {task.completion_percentage >= 100 && !task.is_verified && isLeader && (
                                                    <div className="p-1 bg-rose-500 rounded-full animate-bounce">
                                                        <Zap className="w-2.5 h-2.5 text-white" />
                                                    </div>
                                                )}
                                            </div>

                                            {task.leader_suggestion && (
                                                <div className="mb-2 p-2 bg-amber-500/5 border border-amber-500/10 rounded-lg">
                                                    <p className="text-[7px] font-black uppercase text-amber-500 mb-0.5 flex items-center space-x-1">
                                                        <MessageSquare className="w-2 h-2" />
                                                        <span>Captain's Feedback:</span>
                                                    </p>
                                                    <p className="text-[9px] text-amber-200/50 italic leading-tight line-clamp-2">"{task.leader_suggestion}"</p>
                                                </div>
                                            )}
                                            <div className="flex flex-wrap gap-4">
                                                {task.deadline && (
                                                    <div className="flex items-center space-x-1 text-[9px] text-foreground/40 font-bold uppercase">
                                                        <Calendar className="w-3 h-3" />
                                                        <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
                                                    </div>
                                                )}
                                                <TaskTimer createdAt={task.created_at} status={task.status} />
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2 text-right">
                                            <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${task.status === 'inprogress' ? 'bg-amber-500/10 text-amber-500' : 'bg-white/5 text-foreground/40'}`}>
                                                {task.status}
                                            </div>
                                            {task.is_verified && (
                                                <div className="flex items-center space-x-1 text-[8px] font-black text-emerald-500 uppercase">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    <span>Verified</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Allocated To Header (Prominent) */}
                                    <div className="mb-4 flex items-center justify-between bg-white/5 rounded-xl px-4 py-2 border border-white/5">
                                        <div className="flex items-center space-x-3">
                                            <Users className="w-3.5 h-3.5 text-primary" />
                                            <span className="text-[9px] font-black uppercase text-foreground/40 tracking-wider">Assigned Specialist</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {task.assigned_members?.map((m: any) => (
                                                <div key={m.id} className="flex items-center space-x-1 px-3 py-1 bg-primary text-white rounded-lg text-[9px] font-black uppercase shadow-lg shadow-primary/20">
                                                    <span>{m.username}</span>
                                                    {m.role === 'professional' && (
                                                        <span className="ml-1 opacity-50 border-l border-white/20 pl-1">Captain</span>
                                                    )}
                                                </div>
                                            ))}
                                            {(!task.assigned_members || task.assigned_members.length === 0) && (
                                                <span className="text-[9px] text-foreground/20 italic">Awaiting Deployment</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="space-y-2 mb-6">
                                        <div className="flex justify-between text-[9px] font-black uppercase text-foreground/30">
                                            <span>Progress</span>
                                            <span>{task.completion_percentage || 0}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${task.completion_percentage || 0}%` }}
                                                className={`h-full rounded-full ${task.is_verified ? 'bg-emerald-500' : 'bg-primary'}`}
                                            />
                                        </div>
                                    </div>

                                    {/* Tools for Task */}
                                    {task.tools && (
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {JSON.parse(task.tools).map((toolName: string, i: number) => (
                                                <div key={i} className="flex items-center space-x-1 px-2 py-1 bg-white/5 rounded-lg border border-white/5 text-[8px] font-bold text-foreground/40 group-hover:border-primary/20">
                                                    <Wrench className="w-2.5 h-2.5" />
                                                    <span>{toolName}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                        <div className="flex items-center -space-x-2">
                                            {task.assigned_members?.map((m: any) => (
                                                <div key={m.id} title={m.username} className="w-7 h-7 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-[8px] font-bold text-primary ring-2 ring-primary/5">
                                                    {m.username[0].toUpperCase()}
                                                </div>
                                            ))}
                                            {(!task.assigned_members || task.assigned_members.length === 0) && (
                                                <div className="text-[10px] text-foreground/20 italic">No assignees</div>
                                            )}
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            {isLeader && task.proof_url && (
                                                <a
                                                    href={task.proof_url.startsWith('http') ? task.proof_url : `https://${task.proof_url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="flex items-center space-x-1 px-3 py-1.5 bg-white/5 text-foreground/40 rounded-xl text-[10px] font-bold hover:bg-white/10 transition-all border border-white/5"
                                                >
                                                    <ExternalLink className="w-3 h-3" />
                                                    <span>View Proof</span>
                                                </a>
                                            )}

                                            {isLeader && task.completion_percentage >= 100 && !task.is_verified && (
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleVerifyTask(task.id, true);
                                                        }}
                                                        className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-500 text-white rounded-xl text-[10px] font-bold hover:scale-105 transition-all shadow-lg shadow-emerald-500/20"
                                                    >
                                                        <Check className="w-3 h-3" />
                                                        <span>Accept & Verify</span>
                                                    </button>
                                                </div>
                                            )}
                                            {task.assigned_members?.some((m: any) => m.id === membershipStatus.user_id) && !task.is_verified && (
                                                <button
                                                    onClick={() => setShowProgressModal(task)}
                                                    className="flex items-center space-x-1 px-3 py-1.5 bg-primary/10 text-primary rounded-xl text-[10px] font-bold hover:bg-primary hover:text-white transition-all"
                                                >
                                                    <Upload className="w-3 h-3" />
                                                    <span>Update Progress</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/30 px-2">Completed</h3>
                            {tasks.filter(t => t.status === 'completed').map(task => (
                                <div key={task.id} className={`glass-card p-5 opacity-60 grayscale-[0.5] border-l-4 ${task.is_verified ? 'border-emerald-500/40' : 'border-white/5'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-sm line-through">{task.title}</h4>
                                        {task.is_verified ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <div className="text-[8px] font-black uppercase text-foreground/40">Awaiting Verification</div>}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="flex -space-x-1">
                                            {task.assigned_members?.map((m: any) => (
                                                <div key={m.id} className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[7px] font-bold border border-background">
                                                    {m.username[0].toUpperCase()}
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-[10px] text-foreground/40">Collaboration Project</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Sidebar Stats & Milestones */}
                <aside className="space-y-8">
                    {/* Team Members */}
                    <section className="glass-card p-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-foreground/30 mb-6">Team Roster</h3>
                        <div className="space-y-4">
                            {members.map(member => (
                                <div key={member.id} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-primary">
                                            {member.username[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">{member.username}</p>
                                            <p className="text-[10px] text-foreground/40 italic">
                                                {member.user_role === 'professional' ? 'Captain' : member.role}
                                            </p>
                                        </div>
                                    </div>
                                    {(member.role === 'Founder' || member.user_role === 'professional') && <Shield className="w-3 h-3 text-primary animate-pulse" />}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Milestones */}
                    <section className="glass-card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-black uppercase tracking-widest text-foreground/30">Milestones</h3>
                            {isLeader && (
                                <button onClick={() => setShowMilestoneModal(true)} className="p-1.5 hover:bg-white/5 rounded-lg text-primary">
                                    <Plus className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <div className="space-y-6">
                            {milestones.length === 0 && (
                                <div className="text-center py-4 text-[10px] text-foreground/20 italic">No milestones recorded yet.</div>
                            )}
                            {milestones.map((ms, idx) => (
                                <div key={ms.id} className="relative pl-6 pb-6 last:pb-0">
                                    {idx !== milestones.length - 1 && <div className="absolute left-[7px] top-[14px] bottom-0 w-[2px] bg-white/5" />}
                                    <div className="absolute left-0 top-[2px] w-4 h-4 rounded-full bg-primary border-4 border-background" />
                                    <h4 className="text-sm font-bold text-white">{ms.title}</h4>
                                    <p className="text-[10px] text-foreground/40 mt-1">{ms.description}</p>
                                    <p className="text-[8px] text-primary/60 mt-1 font-bold">{new Date(ms.achieved_at).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Tools Recommendation */}
                    <section className="glass-card p-6 bg-gradient-to-br from-primary/5 to-transparent">
                        <h3 className="text-sm font-black uppercase tracking-widest text-foreground/30 mb-6 flex items-center space-x-2">
                            <Wrench className="w-3 h-3" />
                            <span>Recommended Tools</span>
                        </h3>
                        <div className="space-y-3">
                            {tools.slice(0, 3).map(tool => (
                                <div key={tool.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-primary/50 transition-all group overflow-hidden relative"
                                >
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full -mr-8 -mt-8 group-hover:bg-primary/10 transition-colors" />
                                    <div className="relative z-10 w-full">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-sm font-black text-white">{tool.name}</p>
                                            <ExternalLink className="w-3 h-3 text-foreground/20 group-hover:text-primary transition-colors" />
                                        </div>
                                        <p className="text-[9px] text-foreground/40 mb-4 line-clamp-1">{tool.suggestion || `Powered by ${tool.source_name || 'Global Tech'}`}</p>
                                        <div className="flex items-center space-x-2">
                                            <a
                                                href={tool.url} target="_blank" rel="noreferrer"
                                                className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[8px] font-black uppercase tracking-widest text-center transition-all border border-white/5"
                                            >
                                                Use Tool
                                            </a>
                                            {tool.download_url && (
                                                <a
                                                    href={tool.download_url} target="_blank" rel="noreferrer"
                                                    className="flex-1 py-2 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl text-[8px] font-black uppercase tracking-widest text-center transition-all border border-primary/20"
                                                >
                                                    Download
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 rounded-xl transition-all">
                                Load More Tools
                            </button>
                        </div>
                    </section>
                </aside>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {showTaskModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass w-full max-w-lg p-10 rounded-[3rem] border border-white/10 max-h-[90vh] overflow-y-auto custom-scrollbar">
                            <h2 className="text-2xl font-bold mb-8">Strategize & Assign</h2>
                            <form onSubmit={handleAssignTask} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 ml-2">Objective</label>
                                    <input
                                        placeholder="Task Title" required className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-primary transition-all"
                                        value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 ml-2">Tactical Details</label>
                                    <textarea
                                        placeholder="Description..." required className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-primary h-32 transition-all"
                                        value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 ml-2">Deadline</label>
                                        <input
                                            type="date" required className="w-full bg-[#0a0f1d] border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-primary text-sm"
                                            value={newTask.deadline} onChange={e => setNewTask({ ...newTask, deadline: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2 relative">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 ml-2">Assign Unit</label>
                                        <div
                                            onClick={() => setShowMemberDropdown(!showMemberDropdown)}
                                            className="w-full bg-[#0a0f1d] border border-white/10 rounded-2xl py-4 px-6 flex items-center justify-between cursor-pointer hover:border-primary/50 transition-all"
                                        >
                                            <div className="flex -space-x-2 overflow-hidden">
                                                {newTask.assignedTo.length > 0 ? (
                                                    members.filter(m => newTask.assignedTo.includes(m.user_id.toString())).map(m => (
                                                        <div key={m.user_id} className="w-6 h-6 rounded-full bg-primary border-2 border-[#0a0f1d] flex items-center justify-center text-[8px] font-bold text-white uppercase">
                                                            {m.username[0]}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className="text-sm text-foreground/40">Select Personnel</span>
                                                )}
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-[10px] font-black text-primary">{newTask.assignedTo.length} Active</span>
                                                <ChevronRight className={`w-4 h-4 text-foreground/30 transition-transform ${showMemberDropdown ? 'rotate-90' : ''}`} />
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {showMemberDropdown && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    className="absolute left-0 right-0 top-full mt-2 bg-[#1a1f2e] border border-white/10 rounded-2xl p-4 z-[110] shadow-2xl backdrop-blur-xl"
                                                >
                                                    <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                                                        {members.map(m => {
                                                            const isSelected = newTask.assignedTo.includes(m.user_id.toString());
                                                            return (
                                                                <div
                                                                    key={m.user_id}
                                                                    onClick={() => {
                                                                        const id = m.user_id.toString();
                                                                        const updated = isSelected
                                                                            ? newTask.assignedTo.filter(val => val !== id)
                                                                            : [...newTask.assignedTo, id];
                                                                        setNewTask({ ...newTask, assignedTo: updated });
                                                                    }}
                                                                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${isSelected ? 'bg-primary/20 border border-primary/50' : 'hover:bg-white/5 border border-transparent'}`}
                                                                >
                                                                    <div className="flex items-center space-x-3">
                                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${isSelected ? 'bg-primary text-white' : 'bg-white/5 text-foreground/30'}`}>
                                                                            {m.username[0].toUpperCase()}
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-xs font-bold text-white">{m.username}</p>
                                                                            <p className="text-[8px] text-foreground/40 uppercase font-black">
                                                                                {m.user_role === 'professional' ? 'Captain' : m.role}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    {isSelected && <Check className="w-4 h-4 text-primary" />}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 ml-2">Deployment Tools</label>
                                    <div className="flex flex-wrap gap-2">
                                        {tools.map(tool => (
                                            <div
                                                key={tool.id}
                                                onClick={() => {
                                                    const exists = newTask.tools.includes(tool.name);
                                                    setNewTask({ ...newTask, tools: exists ? newTask.tools.filter(t => t !== tool.name) : [...newTask.tools, tool.name] });
                                                }}
                                                className={`cursor-pointer px-4 py-2 rounded-xl text-[10px] font-bold border transition-all ${newTask.tools.includes(tool.name) ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30' : 'bg-white/5 border-white/10 text-foreground/40 hover:bg-white/10'}`}
                                            >
                                                {tool.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4 border-t border-white/5">
                                    <button type="button" onClick={() => setShowTaskModal(false)} className="flex-1 py-4 text-sm font-bold border border-white/10 rounded-2xl hover:bg-white/5 transition-colors text-white">Cancel</button>
                                    <button type="submit" className="flex-1 py-4 text-sm font-bold bg-primary rounded-2xl text-white shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">Launch Task</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {showProgressModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass w-full max-w-md p-10 rounded-[3rem] border border-white/10">
                            <h2 className="text-2xl font-bold mb-2">Update Progress</h2>
                            <p className="text-[10px] text-foreground/40 uppercase tracking-widest font-black mb-10">{showProgressModal.title}</p>
                            <form onSubmit={handleUpdateProgress} className="space-y-8">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center px-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">Completion Level</label>
                                        <span className="text-primary font-black">{progressData.percentage}%</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="100" step="10"
                                        disabled={!showProgressModal.assigned_members?.some((m: any) => m.id === membershipStatus.user_id)}
                                        className={`w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-primary ${!showProgressModal.assigned_members?.some((m: any) => m.id === membershipStatus.user_id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        value={progressData.percentage} onChange={e => setProgressData({ ...progressData, percentage: parseInt(e.target.value) })}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 ml-2">Proof of Work (URL/Link)</label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                                        <input
                                            placeholder="Drive Link, GitHub PR, etc." required
                                            disabled={!showProgressModal.assigned_members?.some((m: any) => m.id === membershipStatus.user_id)}
                                            className={`w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:border-primary transition-all text-sm ${!showProgressModal.assigned_members?.some((m: any) => m.id === membershipStatus.user_id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            value={progressData.proofUrl} onChange={e => setProgressData({ ...progressData, proofUrl: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {isLeader && !showProgressModal.is_verified && (
                                    <div className="space-y-4 pt-4 border-t border-white/5">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 ml-2">Captain's Command / Suggestion</label>
                                        <textarea
                                            placeholder="Suggest adjustments or refine the goal..."
                                            className="w-full bg-amber-500/5 border border-amber-500/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-amber-500 transition-all text-sm h-24 text-amber-200/60"
                                            value={progressData.suggestion || ''}
                                            onChange={e => setProgressData({ ...progressData, suggestion: e.target.value })}
                                        />
                                        <div className="flex gap-4">
                                            <button
                                                type="button"
                                                onClick={() => handleVerifyTask(showProgressModal.id, false, progressData.suggestion)}
                                                className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest border border-amber-500/20 text-amber-500 rounded-xl hover:bg-amber-500/10 transition-all"
                                            >
                                                Send Feedback
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setShowProgressModal(null)} className="flex-1 py-4 text-sm font-bold border border-white/10 rounded-2xl hover:bg-white/5 transition-colors text-white">Close</button>
                                    {showProgressModal.assigned_members?.some((m: any) => m.id === membershipStatus.user_id) && (
                                        <button type="submit" className="flex-1 py-4 text-sm font-bold bg-primary rounded-2xl text-white shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">Submit for Verification</button>
                                    )}
                                    {!showProgressModal.assigned_members?.some((m: any) => m.id === membershipStatus.user_id) && (
                                        <div className="flex-1 py-4 text-sm font-bold bg-white/5 border border-white/10 rounded-2xl text-foreground/20 text-center flex items-center justify-center space-x-2">
                                            <Shield className="w-3 h-3" />
                                            <span>Read Only</span>
                                        </div>
                                    )}
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {showMilestoneModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass w-full max-w-lg p-10 rounded-[2.5rem] border border-white/10">
                            <h2 className="text-2xl font-bold mb-8">Add Achievement</h2>
                            <form onSubmit={handleAddMilestone} className="space-y-6">
                                <input
                                    placeholder="Milestone Title" required className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-primary"
                                    value={newMilestone.title} onChange={e => setNewMilestone({ ...newMilestone, title: e.target.value })}
                                />
                                <textarea
                                    placeholder="Description of the win" required className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-primary"
                                    value={newMilestone.description} onChange={e => setNewMilestone({ ...newMilestone, description: e.target.value })}
                                />
                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setShowMilestoneModal(false)} className="flex-1 py-3 text-sm font-bold border border-white/10 rounded-xl hover:bg-white/5 transition-colors text-white">Cancel</button>
                                    <button type="submit" className="flex-1 py-4 text-sm font-bold bg-green-500 rounded-xl text-white shadow-lg shadow-green-500/20">Save Milestone</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TeamPage;
