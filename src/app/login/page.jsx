// app/login/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import Image from "next/image";

export default function LoginPage() {
    const { user, signIn, loading } = useAuth();
    const router = useRouter();

    const [isSigningIn, setIsSigningIn] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user) {
            router.push("/problem-solver");
        }
    }, [user, router]);

    const handleGoogleSignIn = async () => {
        setIsSigningIn(true);
        setError(null);

        try {
            const result = await signIn();

            if (result.success) {
                router.push("/problem-solver");
            } else {
                setError(result.error || "Failed to sign in");
            }
        } catch (err) {
            setError("An error occurred while signing in");
        } finally {
            setIsSigningIn(false);
        }
    };

    /* ============================================
       LOADING
    ============================================ */

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0B0B0F]">
                <div className="text-center">
                    <div className="w-14 h-14 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />

                    <p className="text-gray-400 text-sm">
                        Loading CodeMentor...
                    </p>
                </div>
            </div>
        );
    }

    /* ============================================
       LOGIN PAGE
    ============================================ */

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#0B0B0F] relative overflow-hidden">

            {/* =========================================
          BACKGROUND PURPLE GLOW
      ========================================== */}

            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -translate-y-1/2" />

            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl translate-y-1/2" />

            <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-purple-600/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

            {/* =========================================
          MAIN CARD
      ========================================== */}

            <div className="relative w-full max-w-md">

                {/* Purple glow behind card */}
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-violet-600/20 rounded-3xl blur-xl opacity-75" />

                <div className="relative bg-gradient-to-br from-[#171522] to-[#0F0E16] border border-indigo-500/20 rounded-2xl p-8 shadow-[0_30px_50px_-15px_rgba(0,0,0,0.8)]">

                    {/* =====================================
              LOGO + TITLE
          ====================================== */}

                    <div className="text-center mb-8">

                        <div className="flex justify-center mb-4">

                            <div className="relative w-20 h-20">

                                <Image
                                    src="/logo.png"
                                    alt="CodeMentor Logo"
                                    fill
                                    className="object-contain"
                                    priority
                                />

                            </div>

                        </div>

                        <h1 className="text-3xl font-bold text-white mb-2">
                            Welcome to CodeMentor
                        </h1>

                        <p className="text-gray-400 text-sm">
                            Your AI-powered coding mentor
                        </p>

                    </div>

                    {/* =====================================
              FEATURES
          ====================================== */}

                    <div className="space-y-3 mb-8">

                        {[
                            "🤖 AI-powered code fixes",
                            "💬 Interactive learning",
                            "🚀 Learn at your own pace",
                        ].map((feature, i) => (

                            <div
                                key={i}
                                className="flex items-center gap-3 text-gray-300 text-sm"
                            >

                                <span className="text-indigo-400">
                                    ✓
                                </span>

                                {feature}

                            </div>

                        ))}

                    </div>

                    {/* =====================================
              ERROR
          ====================================== */}

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <p className="text-red-400 text-xs text-center">
                                {error}
                            </p>
                        </div>
                    )}

                    {/* =====================================
              GOOGLE SIGN IN
          ====================================== */}

                    <button
                        onClick={handleGoogleSignIn}
                        disabled={isSigningIn}
                        className={`
              w-full
              bg-gradient-to-r
              from-indigo-600
              via-purple-600
              to-violet-600
              text-white
              px-6
              py-3
              rounded-xl
              font-medium
              transition-all
              duration-200
              flex
              items-center
              justify-center
              gap-3
              group
              relative
              overflow-hidden
              shadow-lg
              shadow-indigo-500/20
              ${isSigningIn
                                ? "opacity-75 cursor-not-allowed"
                                : "hover:scale-[1.02] hover:shadow-indigo-500/30"
                            }
            `}
                    >

                        {/* Button shine */}
                        <span
                            className="
                absolute
                inset-0
                bg-gradient-to-r
                from-transparent
                via-white/20
                to-transparent
                -translate-x-full
                group-hover:translate-x-full
                transition-transform
                duration-700
              "
                        />

                        {isSigningIn ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />

                                <span className="relative z-10">
                                    Signing in...
                                </span>
                            </>
                        ) : (
                            <>
                                <FcGoogle className="text-2xl bg-white rounded-full p-1 relative z-10" />

                                <span className="relative z-10">
                                    Continue with Google
                                </span>
                            </>
                        )}

                    </button>

                    {/* =====================================
              TERMS
          ====================================== */}

                    <p className="text-center text-xs text-gray-500 mt-6">
                        By continuing, you agree to our Terms of Service
                    </p>

                </div>
            </div>
        </div>
    );
}