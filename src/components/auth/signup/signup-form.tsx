"use client"

import { Check, Mail, Lock } from 'lucide-react';
import React, { FormEvent, useState } from 'react'
import { PasswordStrengthBar } from './password-strength';
import { UserRegistrationData } from '@/libs/types';
import { ApiError, postRegistrationData } from '@/libs/api';
import Input from '../ui/Input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function SignUpForm() {
    const router = useRouter();
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState<boolean>(false);
    const [agreed, setAgreed] = useState(true);
    const [generalError, setGeneralError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
    const [formData, setFormData] = useState<UserRegistrationData>({
        first_name: "",
        last_name: "",
        username: "",
        email: "",
        password: "",
    });

    const updateField = (field: keyof UserRegistrationData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setFieldErrors((prev) => ({ ...prev, [field]: [] }));
        setGeneralError("");
    };

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        setGeneralError("");
        setFieldErrors({});

        if (formData.password !== confirmPassword) {
            setFieldErrors({...fieldErrors, password_confirm: ["password didn't match"]});
            return;
        }
        if (!formData.first_name){
            setFieldErrors({...fieldErrors, first_name: ["first name can't be null"]});
            return;
        }

        try {
            setLoading(true);
            await postRegistrationData(formData);
            document.cookie = `signup_redirect=${encodeURIComponent(formData.email)}; path=/verify; max-age=30; secure; samesite=lax`;
            router.push('/verify');
        } catch (error) {
            setLoading(false)
            if (error instanceof ApiError) {
                setFieldErrors(error.fieldErrors);
                // setGeneralError(error.message);
                return;
            }

            console.error(error);
            setGeneralError("Registration failed. Please try again.");
        }
    }

    return (
        <form className="mt-6 space-y-4" onSubmit={submit}>
            {generalError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {generalError}
                </div>
            )}

            <Input 
                value={formData.first_name} 
                label="First name" 
                type='text'
                onChange={(e) => updateField('first_name', e.target.value)} 
                placeholder="Ashenafi" 
                error={fieldErrors.first_name?.[0]}
            />

            <Input 
                value={formData.last_name} 
                label="Last name" 
                type='text'
                onChange={(e) => updateField('last_name', e.target.value)} 
                placeholder="Adola" 
                error={fieldErrors.last_name?.[0]}
            />

            <Input 
                value={formData.username} 
                label="Username" 
                type='text'
                onChange={(e) => updateField('username', e.target.value)} 
                placeholder="username"
                error={fieldErrors.username?.[0]}
            />
            <Input 
                value={formData.email} 
                label="Email" 
                onChange={(e) => updateField('email', e.target.value)}  
                Icon={Mail}
                type='email'
                placeholder='ashenafi@gmail.com'
                error={fieldErrors.email?.[0]}
            />
            <Input 
                value={formData.password} 
                label="Password" 
                onChange={(e) => updateField('password', e.target.value)}  
                Icon={Lock}
                type='password'
                placeholder='••••••••••••'
                error={fieldErrors.password?.[0]}
            />
            <PasswordStrengthBar password={formData.password} />

            <Input 
                value={confirmPassword} 
                label="Confirm password" 
                onChange={(e) => setConfirmPassword(e.target.value)}  
                Icon={Lock}
                type='password'
                placeholder='••••••••••••'
                error={fieldErrors.password_confirm?.[0]}
            />

            <label className="flex cursor-pointer items-start gap-2.5">
                <button
                    type="button"
                    onClick={() => setAgreed((v) => !v)}
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded transition-colors ${agreed ? "bg-indigo-600" : "border border-neutral-300 bg-white"
                        }`}
                >
                    {agreed && <Check className="h-3 w-3 text-white" strokeWidth={3.5} />}
                </button>
                <span className="text-sm text-neutral-600">
                    I agree to the{" "}
                    <a href="#" className="font-medium text-indigo-600 hover:underline">
                        Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="font-medium text-indigo-600 hover:underline">
                        Privacy Policy
                    </a>
                </span>
            </label>

            <button
                type="submit"
                disabled={!agreed || loading}
                className={`w-full rounded-xl py-3 text-sm font-semibold text-white transition-colors ${!agreed ?"bg-indigo-400 disabled:*":"bg-indigo-600 hover:bg-indigo-700"}`}
            >
                { loading ? "Creating Account..." :"Create Account"}
            </button>
            <p className="mt-6 text-center text-sm text-neutral-500">
                Already have an account?{" "}
                <Link href="/signin" className="font-semibold text-indigo-600 hover:underline">
                    Log in
                </Link>
            </p>
        </form>
    )
}

export default SignUpForm;