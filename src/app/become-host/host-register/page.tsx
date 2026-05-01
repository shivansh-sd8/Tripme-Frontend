"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/core/store/auth-context";
import { apiClient } from "@/infrastructure/api/clients/api-client";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import Image from "next/image";
import ProtectedRoute from "@/components/shared/ProtectedRoute";

/**
 * Lightweight host registration page for service-intent users.
 * Calls becomeHost() API directly — no property listing onboarding needed.
 * After success, forwards user to the destination stored in sessionStorage
 * (set by ProtectedRoute / hosting/page.tsx flow), or /host/service/new/categories.
 */
export default function HostRegisterPage() {
    const router = useRouter();
    const { user, updateUser, refreshUser } = useAuth();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return; // wait for auth context to load

        // If already a host, skip straight to destination
        if (user?.role === "host") {
            const dest =
                sessionStorage.getItem("hostOnboardingRedirect") ||
                "/host/service/new/categories";
            sessionStorage.removeItem("hostOnboardingRedirect");
            setStatus("success");
            setTimeout(() => router.push(dest), 1500);
            return;
        }

        const register = async () => {
            try {
                const response = await apiClient.becomeHost({});
                if (response.success && response.data?.user) {
                    updateUser(response.data.user);
                } else {
                    // Try refreshing user in case the API succeeded but returned no user
                    await refreshUser(true);
                }

                setStatus("success");

                const dest =
                    sessionStorage.getItem("hostOnboardingRedirect") ||
                    "/host/service/new/categories";
                sessionStorage.removeItem("hostOnboardingRedirect");

                setTimeout(() => router.push(dest), 1800);
            } catch (err: any) {
                console.error("Host registration error:", err);
                setErrorMsg(
                    err?.message ||
                    "Something went wrong. Please try again."
                );
                setStatus("error");
            }
        };

        register();
    }, [user?.role]); // re-run when role changes (e.g. after auth loads)

    return (
        <ProtectedRoute requireAuth={true}>
            <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
                {/* Logo */}
                <div className="mb-10">
                    <Image
                        src="/logo.png"
                        alt="TripMe"
                        width={120}
                        height={48}
                        className="h-12 w-auto object-contain"
                        priority
                    />
                </div>

                {status === "loading" && (
                    <div className="text-center">
                        <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Setting up your host account&hellip;
                        </h2>
                        <p className="text-gray-500 text-base">
                            This only takes a second
                        </p>
                    </div>
                )}

                {status === "success" && (
                    <div className="text-center">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            You&apos;re now a host! 🎉
                        </h2>
                        <p className="text-gray-500 text-base">
                            Taking you to your service setup&hellip;
                        </p>
                    </div>
                )}

                {status === "error" && (
                    <div className="text-center max-w-sm">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-10 h-10 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Registration failed
                        </h2>
                        <p className="text-gray-500 text-base mb-6">{errorMsg}</p>
                        <button
                            onClick={() => {
                                setStatus("loading");
                                setErrorMsg(null);
                                window.location.reload();
                            }}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
                        >
                            Try again
                        </button>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
