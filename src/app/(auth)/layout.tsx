import { getCurrentUser } from '@/libs/auth/session';
import { redirect } from 'next/navigation';
import React from 'react'

type Props = {
    children: React.ReactNode;
}

async function AuthLayout({children}: Props) {
    const user = await getCurrentUser()
    if (user) redirect("/");
  return (
    <div className="flex min-h-screen">
            {/* Left brand panel */}
            <div className="relative hidden w-[46%] shrink-0 overflow-hidden bg-gradient-to-r from-indigo-600 to-indigo-900 lg:flex lg:flex-col lg:justify-between">
                {/* Dot grid pattern */}
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle, white 1px, transparent 1px)",
                        backgroundSize: "28px 28px",
                    }}
                />

                <div className="relative z-10 p-10">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                            <svg viewBox="0 0 24 24" className="h-5 w-5 text-indigo-600" fill="none">
                                <path
                                    d="M4 12l8-5 8 5-8 5-8-5z"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-white">CampusHub</span>
                    </div>
                </div>

                <div className="relative flex-col justify-center  z-10 px-10 pb-10">
                    <h1 className="text-5xl font-extrabold w-full leading-tight text-white">
                        Your campus.
                        <br />
                        Your community.
                        <br />
                        Your questions answered.
                    </h1>
                    <p className="mt-4 max-w-sm text-sm leading-relaxed text-indigo-100">
                        Become part of your university&apos;s digital campus. Collaborate in
                        real-time, get verified tutoring, and stay updated on important
                        academic events.
                    </p>
                </div>

                <div className="relative flex-col justify-center  z-10 px-10 pb-10">
                    <div className="mt-10 flex items-center gap-8">
                        <div>
                            <div className="text-2xl font-extrabold text-white">15k+</div>
                            <div className="text-xs text-indigo-200">Active Students</div>
                        </div>
                        <div className="h-8 w-px bg-white/20" />
                        <div>
                            <div className="text-2xl font-extrabold text-white">120+</div>
                            <div className="text-xs text-indigo-200">University Hubs</div>
                        </div>
                        <div className="h-8 w-px bg-white/20" />
                        <div>
                            <div className="text-2xl font-extrabold text-white">50k+</div>
                            <div className="text-xs text-indigo-200">Resolved Qs</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right form panel */}
            <div className="flex flex-1 items-center justify-center bg-white px-6 py-10">
                {children}
            </div>
        </div>
  )
}

export default AuthLayout