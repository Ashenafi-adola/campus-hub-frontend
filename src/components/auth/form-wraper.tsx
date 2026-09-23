import React from 'react'

type Props = {
    children: React.ReactNode;
    title: string;
    description: string;
}

function AuthFormWrapper({ children, title, description }: Props) {
    return (
        <div className="w-full max-w-sm border border-gray-300 p-5 rounded-2xl shadow">
            <h2 className="text-2xl text-center font-extrabold text-neutral-900">
                {title}
            </h2>
            <p className="mt-1 text-sm text-center text-neutral-500">
                {description}
            </p>

            {children}

        </div>
    )
}

export default AuthFormWrapper