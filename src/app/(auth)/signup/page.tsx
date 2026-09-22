"use client"
import React from "react";
import SignUpForm from "@/components/auth/signup/signup-form";
import AuthFormWrapper from "@/components/auth/form-wraper";

export default function SignUpPage() {

    return (
        <AuthFormWrapper>
            <SignUpForm/>
        </AuthFormWrapper>
    );
}

{/* { <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-neutral-200" />
            <span className="text-xs font-medium text-neutral-400">OR</span>
            <div className="h-px flex-1 bg-neutral-200" />
        </div>} */}

{/* {<OtherOpt/>} */}