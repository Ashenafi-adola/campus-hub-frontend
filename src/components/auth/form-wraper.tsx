import React from 'react'

type Props = {
    children: React.ReactNode;
}

function AuthFormWrapper({ children }: Props) {
    return (
        <div className="w-full max-w-sm border border-gray-300 p-5 rounded-2xl shadow">
            <h2 className="text-2xl font-extrabold text-neutral-900">
                Create your account
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
                Join thousands of students and start learning together
            </p>

            {children}

            <p className="mt-6 text-center text-sm text-neutral-500">
                Already have an account?{" "}
                <a href="#" className="font-semibold text-indigo-600 hover:underline">
                    Log in
                </a>
            </p>
        </div>
    )
}

export default AuthFormWrapper