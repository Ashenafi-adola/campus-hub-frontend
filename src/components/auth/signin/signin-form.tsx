"use client"

import React, { FormEvent, useState } from 'react'
import { Mail, Lock } from 'lucide-react';
import Link from 'next/link'
import Input from '../ui/Input';


interface loginInfo {
    email: string;
    password: string;
}

function SingInForm() {
    const [loginInfo, setLoginInfo] = useState<loginInfo>({
        email: "",
        password: ""
    })
    const submit = (e: FormEvent) => {
        e.preventDefault()
    }
    return (
        <form className="mt-6 space-y-4" onSubmit={submit}>
            <Input
                value={loginInfo.email}
                label="Email"
                onChange={(e) => setLoginInfo({ ...loginInfo, email: e.target.value })}
                Icon={Mail}
                type='email'
                placeholder='ashenafi@gmail.com'
            />
            <Input
                value={loginInfo.password}
                label="Password"
                onChange={(e) => setLoginInfo({ ...loginInfo, password: e.target.value })}
                Icon={Lock}
                type='password'
                placeholder='••••••••••••'
            />
            <div className='flex items-center justify-between'>
                <div className='flex gap-1'>
                    <input type="checkbox" />
                    <span>Remember me</span>
                </div>

                <div>
                    <Link href="#" className='text-blue-600'>
                        Forgot Password?
                    </Link>
                </div>
            </div>

            <button
                type="submit"
                className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-colors bg-indigo-600 hover:bg-indigo-700"
            >
                Log in
            </button>
            <p className="mt-6 text-center text-sm text-neutral-500">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="font-semibold text-indigo-600 hover:underline">
                    Sign Up
                </Link>
            </p>
        </form>
    )
}

export default SingInForm