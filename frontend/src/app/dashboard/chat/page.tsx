"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send, User, Mic, Image as ImageIcon, Smile,
    MoreVertical, MessageSquare, Phone, Video,
    Search, Paperclip, Check, CheckCheck,
    Clock, ArrowLeft, Plus, Users,
    Camera, FileText, Music, MapPin,
    Download, Trash2, Copy, Shield, Lock,
    File, X, CornerUpRight, Globe, Palette, Settings, Volume2, StopCircle
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import Link from 'next/link';

const TelegramUI = () => {
    // Core Logic State
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [socket, setSocket] = useState<Socket | null>(null);
    const [membership, setMembership] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [teamMembers, setTeamMembers] = useState<any[]>([]);
    const [activeChat, setActiveChat] = useState<{ type: 'team' | 'private', id: any, name: string }>({ type: 'team', id: null, name: 'Team Hub' });

    // UI Experience State
    const [showAttach, setShowAttach] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, msgId: any, isSelf: boolean, text: string } | null>(null);
    const [theme, setTheme] = useState('dark');
    const [language, setLanguage] = useState('English');
    const [searchQuery, setSearchQuery] = useState('');
    const [calling, setCalling] = useState<{ active: boolean, type: 'voice' | 'video', status: 'ringing' | 'connected', duration: number, isGroup?: boolean } | null>(null);
    const [incomingCall, setIncomingCall] = useState<any>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeakerOff, setIsSpeakerOff] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);
    const recordInterval = useRef<any>(null);
    const recordingDurationRef = useRef<number>(0);
    const mediaRecorderRef = useRef<any>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // WebRTC Refs
    const pc = useRef<RTCPeerConnection | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (localVideoRef.current && localStream) localVideoRef.current.srcObject = localStream;
    }, [localStream, calling?.active]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) remoteVideoRef.current.srcObject = remoteStream;
    }, [remoteStream, calling?.active]);

    // Sync Refs
    const activeChatRef = useRef(activeChat);
    const userRef = useRef(user);
    const callTimer = useRef<any>(null);

    useEffect(() => {
        activeChatRef.current = activeChat;
        userRef.current = user;
    }, [activeChat, user]);

    useEffect(() => {
        if (calling?.status === 'connected') {
            callTimer.current = setInterval(() => {
                setCalling(prev => prev ? { ...prev, duration: prev.duration + 1 } : null);
            }, 1000);
        } else {
            clearInterval(callTimer.current);
        }
        return () => clearInterval(callTimer.current);
    }, [calling?.status]);

    // 1. Initial Setup
    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(storedUser);

        if (!token) return;

        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);

        const initSession = async () => {
            try {
                const statusRes = await axios.get('http://localhost:5000/api/user/startup-status', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMembership(statusRes.data);

                if (statusRes.data.inTeam) {
                    const sid = statusRes.data.startup_id;
                    const membersRes = await axios.get(`http://localhost:5000/api/startup/${sid}/members`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setTeamMembers(membersRes.data.filter((m: any) => m.user_id !== storedUser.id));

                    newSocket.emit('join_startup', sid);
                    newSocket.emit('join_dm', storedUser.id);

                    if (!activeChatRef.current.id) {
                        const targetChat: { type: 'team' | 'private', id: any, name: string } = { type: 'team', id: sid, name: statusRes.data.project_name };
                        setActiveChat(targetChat);
                        loadHistory('team', sid, storedUser.id);
                    }
                }
            } catch (err: any) {
                console.error(err);
                if (err.response?.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                }
            }
        };

        newSocket.on('connect', () => initSession());

        newSocket.on('chat:message', (msg) => {
            if (msg.senderId !== userRef.current?.id && activeChatRef.current.type === 'team' && msg.startupId === activeChatRef.current.id) {
                setMessages(prev => [...prev, formatIncomingMsg(msg)]);
            }
        });

        newSocket.on('private:message', (msg) => {
            if (msg.senderId !== userRef.current?.id && activeChatRef.current.type === 'private' && msg.senderId === activeChatRef.current.id) {
                setMessages(prev => [...prev, formatIncomingMsg(msg)]);
            }
        });

        newSocket.on('call:incoming', (data) => {
            setIncomingCall(data);
            // Play ringtone logic can go here
        });

        newSocket.on('call:answered', async (data) => {
            if (data.accepted) {
                setCalling(prev => prev ? { ...prev, status: 'connected' } : null);
                // The responder will send an offer or waiting for our offer
                // Here, the initiator creates the offer
                if (pc.current && data.responderId) {
                    const offer = await pc.current.createOffer();
                    await pc.current.setLocalDescription(offer);
                    newSocket.emit('webrtc:signal', { targetId: data.responderSocketId, signal: { type: 'offer', sdp: offer.sdp } });
                }
            } else {
                setCalling(null);
                alert(`${data.responderName} declined the call.`);
            }
        });

        newSocket.on('webrtc:signal', async ({ senderId, signal }) => {
            if (!pc.current) return;

            if (signal.type === 'offer') {
                await pc.current.setRemoteDescription(new RTCSessionDescription(signal));
                const answer = await pc.current.createAnswer();
                await pc.current.setLocalDescription(answer);
                newSocket.emit('webrtc:signal', { targetId: senderId, signal: { type: 'answer', sdp: answer.sdp } });
            } else if (signal.type === 'answer') {
                await pc.current.setRemoteDescription(new RTCSessionDescription(signal));
            } else if (signal.candidate) {
                try {
                    await pc.current.addIceCandidate(new RTCIceCandidate(signal));
                } catch (e) {
                    console.error("Error adding ice candidate", e);
                }
            }
        });

        newSocket.on('call:ended', () => {
            stopMediaAndPC();
            setCalling(null);
            setIncomingCall(null);
        });

        return () => { newSocket.close(); };
    }, []);

    const formatIncomingMsg = (m: any) => {
        const currentUser = userRef.current;
        const msgSenderId = m.senderId || m.sender_id;
        return {
            id: m.id || Date.now(),
            sender: m.senderName || m.sender_name || 'Partner',
            text: m.message,
            type: m.type || 'text',
            url: m.fileUrl || m.file_url,
            timestamp: m.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
            isSelf: Number(msgSenderId) === Number(currentUser?.id),
            status: 'delivered'
        };
    };

    const loadHistory = async (type: 'team' | 'private', id: any, currentUserId?: any) => {
        const token = localStorage.getItem('token');
        if (!id || !token) return;
        try {
            const url = type === 'team' ? `http://localhost:5000/api/chat/history/${id}` : `http://localhost:5000/api/chat/private/${id}`;
            const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });

            const effectiveUserId = currentUserId || user?.id;

            setMessages(res.data.map((m: any) => ({
                id: m.id,
                sender: m.sender_name,
                text: m.message,
                type: m.type || 'text',
                url: m.file_url,
                timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
                isSelf: Number(m.sender_id) === Number(effectiveUserId),
                status: 'read'
            })));
        } catch (err: any) {
            console.error("History error", err);
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
    };

    // Actions
    const handleSendAction = (text: string, type: string = 'text', fileUrl: string | null = null) => {
        if (!socket || !user || (!text.trim() && !fileUrl)) return;
        const targetChat = { ...activeChat };
        const msgData = {
            message: text,
            senderId: user.id,
            senderName: user.username,
            type,
            fileUrl,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
        };

        if (targetChat.type === 'team') socket.emit('chat:message', { ...msgData, startupId: targetChat.id });
        else socket.emit('private:message', { ...msgData, receiverId: targetChat.id });

        const localMsg = { id: Date.now(), sender: 'You', text, type, url: fileUrl, timestamp: msgData.timestamp, isSelf: true, status: 'sent' };
        setMessages(prev => activeChatRef.current.id === targetChat.id ? [...prev, localMsg] : prev);
        setInput('');
        setShowAttach(false);
        setShowEmoji(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/chat/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const type = file.type.startsWith('image/') ? 'image' : 'file';
            handleSendAction(file.name, type, res.data.fileUrl);
        } catch (err) {
            alert("File upload failed");
        } finally {
            setUploading(false);
            setShowAttach(false);
        }
    };

    // Real Voice Recording Implementation
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new (window as any).MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];
            recordingDurationRef.current = 0;

            mediaRecorder.ondataavailable = (event: any) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const finalDuration = recordingDurationRef.current;
                const file = new (window as any).File([audioBlob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });

                const formData = new FormData();
                formData.append('file', file);

                try {
                    const res = await axios.post('http://localhost:5000/api/chat/upload', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    handleSendAction(`Voice Message (${finalDuration}s)`, 'voice', res.data.fileUrl);
                } catch (err) {
                    console.error("Voice upload failed:", err);
                }

                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            recordInterval.current = setInterval(() => {
                setRecordingTime(p => p + 1);
                recordingDurationRef.current += 1;
            }, 1000);
        } catch (err) {
            alert("Microphone access denied or not available");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        clearInterval(recordInterval.current);
        setIsRecording(false);
    };

    const stopMediaAndPC = () => {
        localStream?.getTracks().forEach(track => track.stop());
        setLocalStream(null);
        setRemoteStream(null);
        if (pc.current) {
            pc.current.close();
            pc.current = null;
        }
    };

    const initWebRTC = (isInitiator: boolean, stream: MediaStream, targetSocketId?: string) => {
        const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
        const newPc = new RTCPeerConnection(configuration);

        stream.getTracks().forEach(track => newPc.addTrack(track, stream));

        newPc.onicecandidate = (event) => {
            if (event.candidate && targetSocketId) {
                socket?.emit('webrtc:signal', { targetId: targetSocketId, signal: event.candidate });
            }
        };

        newPc.ontrack = (event) => {
            setRemoteStream(event.streams[0]);
        };

        pc.current = newPc;
    };

    // Call Logic
    const startCall = async (type: 'voice' | 'video') => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: type === 'video'
            });
            setLocalStream(stream);

            const isGroup = activeChat.type === 'team';
            setCalling({ active: true, type, status: 'ringing', duration: 0, isGroup });

            socket?.emit('call:request', {
                startupId: isGroup ? activeChat.id : null,
                receiverId: isGroup ? null : activeChat.id,
                callerName: user.username,
                type,
                isGroup
            });

            initWebRTC(true, stream);
        } catch (err) {
            alert("Could not access camera/microphone");
        }
    };

    const handleAcceptCall = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: incomingCall.type === 'video'
            });
            setLocalStream(stream);
            setCalling({ active: true, type: incomingCall.type, status: 'connected', duration: 0, isGroup: incomingCall.isGroup });

            initWebRTC(false, stream, incomingCall.callerId);

            socket?.emit('call:response', {
                callerId: incomingCall.callerId,
                accepted: true,
                responderName: user.username,
                responderSocketId: socket?.id
            });
            setIncomingCall(null);
        } catch (err) {
            alert("Could not access camera/microphone");
        }
    };

    const handleDeclineCall = () => {
        socket?.emit('call:response', {
            callerId: incomingCall.callerId,
            accepted: false,
            responderName: user.username
        });
        setIncomingCall(null);
    };

    const endCall = () => {
        stopMediaAndPC();
        setCalling(null);
        socket?.emit('call:end', {
            startupId: activeChat.type === 'team' ? activeChat.id : null,
            receiverId: activeChat.type === 'private' ? activeChat.id : null,
            senderId: user.id,
            isGroup: activeChat.type === 'team'
        });
        setIsMuted(false);
        setIsSpeakerOff(false);
    };

    const toggleMute = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(t => t.enabled = isMuted);
            setIsMuted(!isMuted);
        }
    };

    const toggleSpeaker = () => {
        setIsSpeakerOff(!isSpeakerOff);
        if (remoteVideoRef.current) remoteVideoRef.current.muted = !isSpeakerOff;
    };

    const addEmoji = (emoji: string) => setInput(p => p + emoji);

    // Message Context Actions
    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setContextMenu(null);
        alert('Copied to clipboard!');
    };

    const handleDeleteForMe = (id: any) => {
        setMessages(prev => prev.filter(m => m.id !== id));
        setContextMenu(null);
    };

    const handleDeleteForEveryone = async (id: any) => {
        try {
            const token = localStorage.getItem('token');
            const endpoint = activeChat.type === 'team' ? `/api/chat/message/${id}` : `/api/chat/private/${id}`;
            await axios.delete(`http://localhost:5000${endpoint}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Notify others via socket
            if (activeChat.type === 'team') {
                socket?.emit('chat:delete', { id, startupId: activeChat.id });
            } else {
                socket?.emit('private:delete', { id, senderId: user.id, receiverId: activeChat.id });
            }

            setMessages(prev => prev.filter(m => m.id !== id));
            setContextMenu(null);
        } catch (err) {
            console.error('Delete failed:', err);
            alert('Failed to delete for everyone. You may only delete your own messages.');
            setContextMenu(null);
        }
    };

    const downloadHistory = () => {
        const data = JSON.stringify(messages, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `chat_backup_${activeChat.name}_${new Date().toLocaleDateString()}.json`;
        link.click();
        setShowMenu(false);
    };

    useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }, [messages]);

    if (!membership?.inTeam) return <div className="p-20 text-center">Join a team to chat.</div>;

    return (
        <div className={`flex h-[calc(100vh-140px)] rounded-[2.5rem] overflow-hidden shadow-2xl relative transition-colors duration-500 ${theme === 'light' ? 'bg-[#f0f2f5] text-slate-900 border-none' : 'bg-[#0f1721] text-white border border-white/5'}`}>

            {/* Sidebar */}
            <div className={`w-80 md:w-96 border-r flex flex-col ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#17212b] border-black/20'}`}>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-[#10b981] rounded-2xl flex items-center justify-center font-black text-white">
                                {user?.username?.[0].toUpperCase()}
                            </div>
                            <h2 className="text-xl font-bold">{language === 'English' ? 'Chats' : 'चैट्स'}</h2>
                        </div>
                    </div>
                    {/* Search Bar */}
                    <div className={`flex items-center space-x-3 px-4 py-3 rounded-2xl border transition-all ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#242f3d] border-white/5'}`}>
                        <Search className="w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder={language === 'English' ? "Search chats..." : "खोजें..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm w-full font-medium"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {/* Team Hub */}
                    {(!searchQuery || membership.project_name.toLowerCase().includes(searchQuery.toLowerCase())) && (
                        <div onClick={() => { setActiveChat({ type: 'team', id: membership.startup_id, name: membership.project_name }); loadHistory('team', membership.startup_id); }} className={`p-4 mx-2 rounded-2xl flex items-center space-x-4 cursor-pointer transition-all ${activeChat.id === membership.startup_id ? 'bg-[#10b981]/20' : 'hover:bg-primary/5'}`}>
                            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[1.2rem] flex items-center justify-center text-white shadow-lg"><Users className="w-7 h-7" /></div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm truncate uppercase">{membership.project_name}</h4>
                                <p className="text-xs opacity-40 truncate">{language === 'English' ? 'Global Team Room' : 'ग्लोबल टीम रूम'}</p>
                            </div>
                        </div>
                    )}

                    {/* Private Chats */}
                    {teamMembers.filter(m => m.username.toLowerCase().includes(searchQuery.toLowerCase())).map(m => (
                        <div key={m.user_id} onClick={() => { setActiveChat({ type: 'private', id: m.user_id, name: m.username }); loadHistory('private', m.user_id); }} className={`p-4 mx-2 rounded-2xl flex items-center space-x-4 cursor-pointer transition-all ${activeChat.id === m.user_id ? 'bg-[#10b981]/20' : 'hover:bg-primary/5'}`}>
                            <div className="w-14 h-14 bg-slate-200 dark:bg-[#242f3d] rounded-[1.2rem] flex items-center justify-center text-[#10b981] font-black text-xl">{m.username[0].toUpperCase()}</div>
                            <div className="flex-1 min-w-0"><h4 className="font-bold text-sm truncate">{m.username}</h4><p className="text-[10px] opacity-40 uppercase font-black">{m.role}</p></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat View */}
            <div className="flex-1 flex flex-col relative">
                <header className={`h-20 px-8 flex items-center justify-between border-b shrink-0 z-20 ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#17212b]/95 backdrop-blur-xl border-black/20'}`}>
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#0f1721] flex items-center justify-center text-[#4f46e5] font-black">{activeChat.name[0]?.toUpperCase()}</div>
                        <div>
                            <h4 className="font-bold text-[15px]">{activeChat.name}</h4>
                            <p className="text-[10px] text-[#4f46e5] font-black uppercase tracking-widest flex items-center"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse" />Online</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button onClick={() => startCall('voice')} className="p-3 hover:bg-primary/10 rounded-2xl transition-all text-[#4f46e5]"><Phone className="w-5 h-5" /></button>
                        <button onClick={() => startCall('video')} className="p-3 hover:bg-primary/10 rounded-2xl transition-all text-[#4f46e5]"><Video className="w-5 h-5" /></button>
                        <div className="relative">
                            <button onClick={() => setShowMenu(!showMenu)} className="p-3 hover:bg-primary/10 rounded-2xl transition-all"><MoreVertical className="w-5 h-5" /></button>
                            <AnimatePresence>
                                {showMenu && (
                                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className={`absolute right-0 top-full mt-2 w-56 rounded-[1.5rem] shadow-2xl p-2 z-[100] ${theme === 'light' ? 'bg-white border border-slate-200' : 'bg-[#1c242d] border border-white/10'}`}>
                                        <button onClick={() => { setLanguage(language === 'English' ? 'Hindi' : 'English'); setShowMenu(false); }} className="w-full flex items-center space-x-4 p-4 hover:bg-primary/10 rounded-2xl text-sm font-bold">
                                            <Globe className="w-5 h-5 text-blue-400" />
                                            <span>{language === 'English' ? 'Hindi Mein Badle' : 'Switch to English'}</span>
                                        </button>
                                        <button onClick={() => { setTheme(theme === 'dark' ? 'light' : 'dark'); setShowMenu(false); }} className="w-full flex items-center space-x-4 p-4 hover:bg-primary/10 rounded-2xl text-sm font-bold">
                                            <Palette className="w-5 h-5 text-indigo-400" />
                                            <span>{language === 'English' ? `Theme: ${theme === 'dark' ? 'Light' : 'Dark'}` : `थीम: ${theme === 'dark' ? 'लाइट' : 'डार्क'}`}</span>
                                        </button>
                                        <button onClick={downloadHistory} className="w-full flex items-center space-x-4 p-4 hover:bg-primary/10 rounded-2xl text-sm font-bold">
                                            <Download className="w-5 h-5 text-emerald-400" />
                                            <span>{language === 'English' ? 'Backup History' : 'बैकअप इतिहास'}</span>
                                        </button>
                                        <button onClick={() => { alert('Voice Settings: Enabled'); setShowMenu(false); }} className="w-full flex items-center space-x-4 p-4 hover:bg-primary/10 rounded-2xl text-sm font-bold"><Volume2 className="w-5 h-5 text-green-400" /><span>Voice Settings</span></button>
                                        <button className="w-full flex items-center space-x-4 p-4 hover:bg-primary/10 rounded-2xl text-sm font-bold"><Settings className="w-5 h-5 text-slate-400" /><span>Privacy</span></button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                {/* Feed */}
                <div ref={scrollRef} className={`flex-1 overflow-y-auto p-10 space-y-6 custom-scrollbar z-10 ${theme === 'light' ? 'bg-slate-50' : 'bg-[#0e1621]'}`}>
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.isSelf ? 'justify-end' : 'justify-start'}`}>
                            <div
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    setContextMenu({ x: e.pageX, y: e.pageY, msgId: msg.id, isSelf: msg.isSelf, text: msg.text });
                                }}
                                className={`
                                max-w-[75%] p-4 px-5 rounded-[1.8rem] relative shadow-lg transition-all cursor-pointer
                                ${msg.isSelf
                                        ? 'bg-[#10b981] rounded-tr-none' // Emerald Green for Me (Right)
                                        : 'bg-[#f1f5f9] rounded-tl-none border border-slate-200'} // Slate White for Them (Left)
                            `}>
                                {/* Sender name for group chats (Them only) */}
                                {!msg.isSelf && activeChat.type === 'team' && (
                                    <p className="text-[10px] font-black text-[#10b981] mb-2 uppercase tracking-widest leading-none">
                                        {msg.sender}
                                    </p>
                                )}

                                {msg.type === 'voice' ? (
                                    <div className="flex flex-col space-y-2">
                                        <div className="flex items-center space-x-3 bg-black/10 p-3 rounded-[1.2rem]">
                                            <button className="p-2 bg-[#10b981] text-white rounded-full"><Volume2 className="w-4 h-4" /></button>
                                            <audio src={msg.url} controls className="h-8 max-w-[150px] custom-audio-player" />
                                        </div>
                                        <span className={`text-[10px] font-bold ${msg.isSelf ? 'text-white/60' : 'text-slate-500'}`}>
                                            {msg.isSelf ? 'Your Voice Note' : `${msg.sender}'s Voice Note`}
                                        </span>
                                    </div>
                                ) : msg.type === 'image' ? (
                                    <div className="space-y-2">
                                        <img src={msg.url} alt="Shared" className="max-w-full rounded-2xl border border-black/5 shadow-sm" />
                                        {msg.text !== 'image' && <p className={`text-sm font-semibold ${msg.isSelf ? 'text-white' : 'text-slate-700'}`}>{msg.text}</p>}
                                    </div>
                                ) : msg.type === 'file' || msg.type === 'document' ? (
                                    <div className={`flex items-center space-x-4 p-4 rounded-2xl border ${msg.isSelf ? 'bg-white/10 border-white/20' : 'bg-slate-200 border-slate-300'}`}>
                                        <div className="p-3 bg-[#10b981] text-white rounded-xl shadow-lg">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xs font-bold truncate ${msg.isSelf ? 'text-white' : 'text-slate-900'}`}>{msg.text}</p>
                                            <a href={msg.url} target="_blank" download className="text-[10px] font-black uppercase text-[#059669] hover:underline mt-1 block">Download File</a>
                                        </div>
                                    </div>
                                ) : (
                                    <p className={`text-sm font-semibold leading-relaxed ${msg.isSelf ? 'text-white' : 'text-slate-800'
                                        }`}>
                                        {msg.text}
                                    </p>
                                )}

                                <div className="flex items-center justify-end space-x-1 mt-1 opacity-40 text-[9px] font-black">
                                    <span className={msg.isSelf ? 'text-white/70' : 'text-slate-500'}>{msg.timestamp}</span>
                                    {msg.isSelf && (
                                        msg.status === 'read' ? <CheckCheck className="w-3 h-3 text-white" /> : <Check className="w-3 h-3 text-white/70" />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input */}
                <div className={`p-6 border-t ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#17212b] border-white/5'}`}>
                    <div className="max-w-5xl mx-auto flex items-end space-x-4">
                        <div className={`flex-1 rounded-[2rem] flex flex-col p-2 relative shadow-inner ${theme === 'light' ? 'bg-slate-100' : 'bg-[#242f3d]'}`}>
                            <AnimatePresence>
                                {showEmoji && (
                                    <motion.div
                                        key="emoji-keyboard"
                                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                        className={`absolute bottom-full left-0 mb-6 p-4 rounded-[2rem] shadow-2xl grid grid-cols-6 gap-2 w-72 z-[100] ${theme === 'light' ? 'bg-white border border-slate-100' : 'bg-[#242f3d] border border-white/10'}`}
                                    >
                                        {['😊', '🚀', '🔥', '💎', '👏', '💡', '💻', '📈', '🤝', '✨', '✅', '🎯'].map(e => (
                                            <button key={e} onClick={() => addEmoji(e)} className="text-2xl hover:scale-125 transition-all">{e}</button>
                                        ))}
                                    </motion.div>
                                )}
                                {showAttach && (
                                    <motion.div
                                        key="attachment-menu"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className={`absolute bottom-full left-0 mb-6 p-4 rounded-[2rem] shadow-2xl flex flex-col space-y-2 w-56 z-[60] ${theme === 'light' ? 'bg-white border' : 'bg-[#1c242d] border border-white/10'}`}
                                    >
                                        <label className="flex items-center space-x-4 p-4 hover:bg-primary/10 rounded-2xl cursor-pointer">
                                            <ImageIcon className="w-5 h-5 text-purple-400" />
                                            <span className="text-sm font-bold">{language === 'English' ? 'Photo/Video' : 'फ़ोटो/वीडियो'}</span>
                                            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                                        </label>
                                        <label className="flex items-center space-x-4 p-4 hover:bg-primary/10 rounded-2xl cursor-pointer">
                                            <FileText className="w-5 h-5 text-blue-400" />
                                            <span className="text-sm font-bold">{language === 'English' ? 'Document' : 'दस्तावेज़'}</span>
                                            <input type="file" className="hidden" onChange={handleFileUpload} />
                                        </label>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex items-center">
                                <button onClick={() => setShowAttach(!showAttach)} className="p-4 text-slate-400 hover:text-[#10b981] transition-all"><Paperclip className="w-6 h-6 rotate-45" /></button>
                                {isRecording ? (
                                    <div className="flex-1 flex items-center space-x-4 px-4 py-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
                                        <span className="text-sm font-black text-red-500 italic">{language === 'English' ? 'Recording...' : 'रिकॉर्डिंग...'} {recordingTime}s</span>
                                    </div>
                                ) : (
                                    <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendAction(input); } }} placeholder={language === 'English' ? "Compose a message..." : "संदेश लिखें..."} rows={1} className="flex-1 bg-transparent border-none resize-none py-4 px-4 outline-none text-[15px] font-medium" />
                                )}
                                <button onClick={() => setShowEmoji(!showEmoji)} className="p-4 text-slate-400 hover:text-[#10b981] transition-all"><Smile className="w-6 h-6" /></button>
                            </div>
                        </div>
                        {isRecording ? (
                            <button onClick={stopRecording} className="p-5 bg-red-500 text-white rounded-full shadow-2xl animate-pulse"><StopCircle className="w-7 h-7" /></button>
                        ) : input.trim() ? (
                            <button onClick={() => handleSendAction(input)} className="p-5 bg-[#10b981] text-white rounded-[1.8rem] shadow-xl shadow-emerald-500/20 hover:scale-110 active:scale-95 transition-all"><Check className="w-7 h-7" /></button>
                        ) : (
                            <button onClick={startRecording} className="p-5 bg-emerald-500/10 text-[#10b981] rounded-[1.8rem] hover:bg-[#10b981] hover:text-white transition-all"><Mic className="w-7 h-7" /></button>
                        )}
                    </div>
                </div>
            </div>

            {/* Context Menu */}
            <AnimatePresence>
                {contextMenu && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed z-[1000] w-56 bg-white dark:bg-[#1c242d] rounded-[1.5rem] shadow-2xl border border-slate-200 dark:border-white/10 p-2 overflow-hidden"
                        style={{ top: contextMenu.y, left: contextMenu.x }}
                    >
                        <button onClick={() => handleCopy((contextMenu as any).text)} className="w-full flex items-center space-x-4 p-4 hover:bg-[#10b981]/10 rounded-2xl text-sm font-bold text-slate-700 dark:text-white">
                            <Copy className="w-4 h-4" />
                            <span>{language === 'English' ? 'Copy Text' : 'कॉपी करें'}</span>
                        </button>
                        <button onClick={() => handleDeleteForMe(contextMenu.msgId)} className="w-full flex items-center space-x-4 p-4 hover:bg-red-500/10 rounded-2xl text-sm font-bold text-red-500">
                            <Trash2 className="w-4 h-4" />
                            <span>{language === 'English' ? 'Delete for Me' : 'मेरे लिए हटाएं'}</span>
                        </button>
                        {contextMenu.isSelf && (
                            <button onClick={() => handleDeleteForEveryone(contextMenu.msgId)} className="w-full flex items-center space-x-4 p-4 hover:bg-red-500/20 rounded-2xl text-sm font-bold text-red-600">
                                <Trash2 className="w-4 h-4 " />
                                <span>{language === 'English' ? 'Delete for Everyone' : 'सबके लिए हटाएं'}</span>
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Premium Call Screen Overlay */}
            <AnimatePresence>
                {calling && (
                    <motion.div
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className={`fixed inset-0 z-[2000] flex flex-col items-center justify-center text-white ${calling.type === 'video' ? 'bg-black' : 'bg-slate-950/95 backdrop-blur-2xl'}`}
                    >
                        <div className="absolute top-10 left-10 flex items-center space-x-3 opacity-60">
                            <Lock className="w-4 h-4" />
                            <span className="text-xs font-black uppercase tracking-widest text-[#10b981]">End-to-End Encrypted</span>
                        </div>


                        {/* Video Feed Layer */}
                        {calling.type === 'video' && (
                            <div className="absolute inset-0 z-0 flex flex-col md:flex-row bg-black">
                                <div className="flex-1 relative border-r border-white/5">
                                    <video
                                        ref={remoteVideoRef}
                                        autoPlay
                                        playsInline
                                        className="w-full h-full object-cover"
                                    />
                                    {calling.status === 'ringing' && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                                            <p className="text-xl font-black animate-pulse uppercase tracking-[0.3em]">Waiting...</p>
                                        </div>
                                    )}
                                </div>
                                <div className="w-full md:w-80 h-1/3 md:h-full relative bg-slate-900 overflow-hidden border-t md:border-t-0 md:border-l border-white/10">
                                    <video
                                        ref={localVideoRef}
                                        autoPlay
                                        muted
                                        playsInline
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">You</div>
                                </div>
                            </div>
                        )}

                        {/* UI Overlay */}
                        <div className="z-10 flex flex-col items-center justify-center w-full h-full pointer-events-none">
                            <div className="flex flex-col items-center space-y-8 mb-20 text-center pointer-events-auto">
                                {/* Caller Info (Moved here) */}
                                <div className="flex flex-col items-center space-y-8 mb-8 text-center">
                                    <motion.div
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="w-40 h-40 rounded-[3rem] bg-gradient-to-br from-[#10b981] to-emerald-800 flex items-center justify-center text-6xl font-black shadow-2xl shadow-emerald-500/20"
                                    >
                                        {activeChat.name[0].toUpperCase()}
                                    </motion.div>
                                    <div>
                                        <h2 className="text-4xl font-black mb-2">{activeChat.name}</h2>
                                        <div className="flex items-center justify-center space-x-3">
                                            <span className={`w-2 h-2 rounded-full ${calling.status === 'ringing' ? 'bg-yellow-400 animate-pulse' : 'bg-emerald-500'}`} />
                                            <p className="text-sm font-black uppercase tracking-[0.2em] opacity-60">
                                                {calling.status === 'ringing'
                                                    ? (language === 'English' ? 'Ringing...' : 'घंटी बज रही है...')
                                                    : (language === 'English' ? `Connected • ${Math.floor(calling.duration / 60)}:${(calling.duration % 60).toString().padStart(2, '0')}` : `जुड़ा हुआ • ${Math.floor(calling.duration / 60)}:${(calling.duration % 60).toString().padStart(2, '0')}`)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                {calling.type === 'voice' && (
                                    <div className="absolute inset-0 z-[-1] flex items-center justify-center opacity-20 overflow-hidden">
                                        <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }} transition={{ duration: 4, repeat: Infinity }} className="w-[800px] h-[800px] border-[50px] border-emerald-500 rounded-full" />
                                        <motion.div animate={{ scale: [1.2, 1.7, 1.2], opacity: [0.2, 0.05, 0.2] }} transition={{ duration: 5, repeat: Infinity, delay: 1 }} className="absolute w-[600px] h-[600px] border-[30px] border-emerald-400 rounded-full" />
                                    </div>
                                )}

                                {/* Call Actions */}
                                <div className="flex items-center space-x-8">
                                    <button onClick={toggleMute} className={`p-6 rounded-[2rem] transition-all ${isMuted ? 'bg-red-500/50 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                                        <Mic className={`w-6 h-6 ${isMuted ? 'opacity-50' : ''}`} />
                                    </button>
                                    <button onClick={endCall} className="p-10 bg-red-500 hover:bg-red-600 rounded-[2.5rem] shadow-2xl shadow-red-500/40 transform hover:scale-110 active:scale-95 transition-all">
                                        <Phone className="w-8 h-8 rotate-[135deg]" />
                                    </button>
                                    <button onClick={toggleSpeaker} className={`p-6 rounded-[2rem] transition-all ${isSpeakerOff ? 'bg-red-500/50 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                                        {calling.type === 'video' ? (isMuted ? <Video className="w-6 h-6 opacity-50" /> : <Video className="w-6 h-6" />) : (isSpeakerOff ? <Volume2 className="w-6 h-6 opacity-50" /> : <Volume2 className="w-6 h-6" />)}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Incoming Call Screen Overlay */}
            <AnimatePresence>
                {incomingCall && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="fixed bottom-10 right-10 z-[2100] w-96 glass-dark border border-white/10 p-6 rounded-[2.5rem] shadow-2xl flex flex-col items-center bg-[#0f1721]/95 backdrop-blur-3xl text-white"
                    >
                        <div className="flex items-center space-x-4 mb-6 w-full px-4">
                            <div className="w-16 h-16 rounded-[1.2rem] bg-emerald-500 flex items-center justify-center text-2xl font-black">
                                {incomingCall.callerName[0].toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-lg">{incomingCall.callerName}</h4>
                                <p className="text-xs opacity-60 uppercase tracking-widest font-black">
                                    {incomingCall.isGroup ? 'Group Call' : 'Incoming Call'} • {incomingCall.type}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4 w-full px-4">
                            <button onClick={handleDeclineCall} className="flex-1 py-4 bg-red-500 hover:bg-red-600 rounded-2xl font-bold flex items-center justify-center space-x-2 transition-all">
                                <X className="w-5 h-5" />
                                <span>Decline</span>
                            </button>
                            <button onClick={handleAcceptCall} className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-600 rounded-2xl font-bold flex items-center justify-center space-x-2 transition-all">
                                <Phone className="w-5 h-5" />
                                <span>Answer</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Global Click Handler to close menus */}
            {(showMenu || contextMenu || showEmoji || showAttach) && (
                <div
                    className="fixed inset-0 z-[50]"
                    onClick={() => { setShowMenu(false); setContextMenu(null); setShowEmoji(false); setShowAttach(false); }}
                    onContextMenu={(e) => { e.preventDefault(); setContextMenu(null); }}
                />
            )}

            <style jsx global>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 20px; } textarea::-webkit-scrollbar { display: none; }`}</style>
        </div>
    );
};

export default TelegramUI;
