"use client";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import axios from "axios";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isFreelancer, setIsFreelancer] = useState(false);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();
    const isFreelancePage = pathname === '/dashboard/freelancer' || pathname === '/dashboard/part-time' || pathname === '/dashboard/non-tech';

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const res = await axios.get('http://localhost:5000/api/user/startup-status', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const role = res.data?.globalRole?.toLowerCase();
                if (role === 'freelancer' || role === 'freelance') {
                    setIsFreelancer(true);
                }
            } catch (error) {
                console.error('Layout: Failed to fetch status');
            } finally {
                setLoading(false);
            }
        };
        fetchStatus();
    }, []);

    if (loading) return <div className="min-h-screen bg-[#0a0f1d]" />;

    return (
        <div className="flex min-h-screen bg-background">
            {!isFreelancer && !isFreelancePage && <Sidebar />}
            <main className={`flex-1 flex flex-col transition-all w-full max-w-full overflow-x-hidden ${(isFreelancer || isFreelancePage) ? 'm-0 p-4 md:p-8 pt-0' : 'ml-0 md:ml-[80px] lg:ml-[280px] p-4 md:p-6'}`}>
                {!isFreelancer && !isFreelancePage && <Topbar />}
                <div className={`flex-1 ${(!isFreelancer && !isFreelancePage) ? 'mt-4' : 'mt-8'}`}>
                    {children}
                </div>
            </main>
        </div>
    );
}
