"use client"

import { usePathname } from 'next/navigation';
import React from 'react'

type Props = {
    children: React.ReactNode;
}

function AuthFormWrapper({ children }: Props) {
    const pathname = usePathname();

    return (
        <div className="w-full max-w-sm border border-gray-300 p-5 rounded-2xl shadow">
            <h2 className="text-2xl text-center font-extrabold text-neutral-900">
                {pathname === "/signup" ? "Create your account" : "Welcome Back"}
            </h2>
            <p className="mt-1 text-sm text-center text-neutral-500">
                {
                    pathname === "/signup" ?
                    "Join thousands of students and start learning together"
                    : "Log in to your account to continue collaborating."
                }
            </p>

            {children}

        </div>
    )
}

export default AuthFormWrapper