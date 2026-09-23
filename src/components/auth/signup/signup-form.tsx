import { BookOpen, Check, Mail, User, Lock } from 'lucide-react';
import React, { FormEvent, useState } from 'react'
import { PasswordStrengthBar } from './password-strength';
import { UserRegistrationData } from '@/libs/types';
import { postRegistrationData } from '@/libs/api';
import Input from '../ui/Input';
import Link from 'next/link';


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
            <Input 
                value={formData.first_name} 
                label="First name" 
                type='text'
                onChange={(e)=>setFormData({...formData, first_name: e.target.value})} 
                placeholder="Ashenafi" 
            />

            <Input 
                value={formData.last_name} 
                label="Last name" 
                type='text'
                onChange={(e)=>setFormData({...formData, last_name: e.target.value})} 
                placeholder="Adola" 
            />

            <Input 
                value={formData.username} 
                label="Username" 
                type='text'
                onChange={(e)=>setFormData({...formData, username: e.target.value})} 
                placeholder="username"
            />
            <Input 
                value={formData.email} 
                label="Email" 
                onChange={(e)=>setFormData({...formData, email: e.target.value})}  
                Icon={Mail}
                type='email'
                placeholder='ashenafi@gmail.com'
            />
            <Input 
                value={formData.password} 
                label="Password" 
                onChange={(e)=>setFormData({...formData, password: e.target.value})}  
                Icon={Lock}
                type='password'
                placeholder='••••••••••••'
            />
            <PasswordStrengthBar password={formData.password} />

            <Input 
                value={confirmPassword} 
                label="Confirm password" 
                onChange={(e)=>setConfirmPassword(e.target.value)}  
                Icon={Lock}
                type='password'
                placeholder='••••••••••••'
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
                disabled={!agreed}
                className={`w-full rounded-xl py-3 text-sm font-semibold text-white transition-colors ${!agreed ?"bg-indigo-400 disabled:*":"bg-indigo-600 hover:bg-indigo-700"}`}
            >
                Create Account
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