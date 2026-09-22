import { BookOpen, Check, Mail, User, Lock } from 'lucide-react';
import React, { FormEvent, useState } from 'react'
import { PasswordStrengthBar } from './password-strength';
import { UserRegistrationData } from '@/libs/types';
import { postRegistrationData } from '@/libs/api';


function SignUpForm() {
    const [confirmPassword, setConfirmPassword] = useState("");
    const [agreed, setAgreed] = useState(true);
    const [formData, setFormData] = useState<UserRegistrationData>({
        first_name: "",
        last_name: "",
        username: "",
        email: "",
        password: "",
    });

    const submit = async (e:FormEvent) => {
        e.preventDefault()
        const res = await postRegistrationData(formData)
        console.log(res)
    }

    return (
        <form className="mt-6 space-y-4" onSubmit={submit}>
            <div>
                <label className="mb-1.5 block text-sm font-semibold text-neutral-800">
                    First name
                </label>
                <div className="relative">
                    {/* {<User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />} */}
                    <input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                        placeholder="Ashenafi"
                        className="w-full rounded-xl border border-neutral-200 py-2.5 pl-5 pr-3.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                    />
                </div>
            </div>

            <div>
                <label className="mb-1.5 block text-sm font-semibold text-neutral-800">
                    Last name
                </label>
                <div className="relative">
                    {/* {<BookOpen className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />} */}
                    <input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                        placeholder="Adola"
                        className="w-full rounded-xl border border-neutral-200 py-2.5 pl-5 pr-3.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                    />
                </div>
            </div>

            <div>
                <label className="mb-1.5 block text-sm font-semibold text-neutral-800">
                    Username
                </label>
                <div className="relative">
                    {/* {<BookOpen className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />} */}
                    <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                        placeholder="username"
                        className="w-full rounded-xl border border-neutral-200 py-2.5 pl-5 pr-3.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                    />
                </div>
            </div>

            <div>
                <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-sm font-semibold text-neutral-800">
                        Email
                    </label>
                </div>
                <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="ashenafi@gmail.com"
                        className="w-full rounded-xl border border-neutral-200 py-2.5 pl-10 pr-3.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                    />
                </div>
            </div>

            <div>
                <label className="mb-1.5 block text-sm font-semibold text-neutral-800">
                    Password
                </label>
                <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        placeholder="••••••••••••"
                        className="w-full rounded-xl border border-neutral-200 py-2.5 pl-10 pr-3.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                    />
                </div>
                <PasswordStrengthBar password={formData.password} />
            </div>

            <div>
                <label className="mb-1.5 block text-sm font-semibold text-neutral-800">
                    Confirm password
                </label>
                <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full rounded-xl border border-neutral-200 py-2.5 pl-10 pr-3.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                    />
                </div>
            </div>

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
                className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
            >
                Create Account
            </button>
        </form>
    )
}

export default SignUpForm;