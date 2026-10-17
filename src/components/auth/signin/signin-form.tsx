"use client"

import React, { FormEvent, useState } from 'react'
import { Mail, Lock } from 'lucide-react';
import Link from 'next/link'
import Input from '../ui/Input';
import { postAuth } from '@/libs/auth/submit';
import { AuthUser } from '@/libs/auth/types';
import { useRouter } from 'next/navigation';

interface loginInfo {
    email: string;
    password: string;
}

function SingInForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [generalError, setGeneralError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
    const [loginInfo, setLoginInfo] = useState<loginInfo>({
        email: "",
        password: ""
    });

    const validate = (values: loginInfo): Record<string, string[]> => {
        const errors: Record<string, string[]> = {};

        if (!values.email.trim()) {
            errors.email = ["Email is required."];
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
            errors.email = ["Enter a valid email address."];
        }

        if (!values.password) {
            errors.password = ["Password is required."];
        } else if (values.password.length < 8) {
            errors.password = ["Password must be at least 8 characters long."];
        }

        return errors;
    };

    const updateField = (field: keyof loginInfo, value: string) => {
        setLoginInfo((prev) => ({ ...prev, [field]: value }));
        setFieldErrors((prev) => ({ ...prev, [field]: [] }));
        setGeneralError("");
    };

    const submit = async (e: FormEvent) => {
        e.preventDefault();

        const errors = validate(loginInfo);
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setLoading(true);
        setGeneralError("");
        setFieldErrors({});

        try {
            const res = await postAuth<{ user: AuthUser }>('/api/auth/login', {
                email: loginInfo.email.trim(),
                password: loginInfo.password,
            });

            if (res.ok) {
                router.push('/');
                return;
            }

            if (Object.keys(res.fieldErrors ?? {}).length > 0) {
                setFieldErrors(res.fieldErrors ?? {});
            }

            setGeneralError(res.detail ?? 'Unable to sign in. Please try again.');
        } catch (error) {
            console.error(error);
            setGeneralError('Unable to sign in. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="mt-6 space-y-4" onSubmit={submit} noValidate>
            {generalError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                    {generalError}
                </div>
            )}

            <Input
                value={loginInfo.email}
                label="Email"
                onChange={(e) => updateField('email', e.target.value)}
                Icon={Mail}
                type='email'
                placeholder='ashenafi@gmail.com'
                error={fieldErrors.email?.[0]}
            />
            <Input
                value={loginInfo.password}
                label="Password"
                onChange={(e) => updateField('password', e.target.value)}
                Icon={Lock}
                type='password'
                placeholder='••••••••••••'
                error={fieldErrors.password?.[0]}
            />
            <div className='flex items-center justify-between'>
                <div className='flex gap-1'>
                    <input type="checkbox" className="accent-indigo-600" />
                    <span className="text-neutral-700 dark:text-neutral-300">Remember me</span>
                </div>

                <div>
                    <Link href="/forgot-pwd" className='text-blue-600'>
                        Forgot Password?
                    </Link>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-colors bg-indigo-600 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
            >
                {loading ? 'Signing in...' : 'Log in'}
            </button>
            <p className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="font-semibold text-indigo-600 hover:underline">
                    Sign Up
                </Link>
            </p>
        </form>
    )
}

export default SingInForm