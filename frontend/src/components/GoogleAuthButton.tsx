"use client";

import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function GoogleAuthButton() {
    const router = useRouter();
    const [error, setError] = useState("");

    const handleSuccess = async (response: any) => {
        try {
            const res = await axios.post("http://localhost:5000/api/google-auth", {
                tokenId: response.credential,
            });

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            router.push("/categories");
        } catch (err: any) {
            console.error("Google Auth Error:", err);
            setError(err.response?.data?.message || "Google Authentication Failed");
        }
    };

    return (
        <div className="w-full flex flex-col items-center gap-4 mt-6">
            <div className="flex items-center w-full gap-4">
                <div className="h-px bg-white/10 flex-1"></div>
                <span className="text-xs text-foreground/40 font-medium">OR CONTINUE WITH</span>
                <div className="h-px bg-white/10 flex-1"></div>
            </div>

            <div className="w-full flex justify-center">
                <GoogleLogin
                    onSuccess={handleSuccess}
                    onError={() => setError("Google Login Failed")}
                    theme="filled_black"
                    shape="circle"
                    width="100%"
                />
            </div>

            {error && (
                <p className="text-rose-500 text-[10px] font-bold text-center">
                    {error}
                </p>
            )}
        </div>
    );
}
