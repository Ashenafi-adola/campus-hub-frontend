import React from 'react'

type Props = {
    children: React.ReactNode;
    title: string;
    description: string;
}

function AuthFormWrapper({ children, title, description }: Props) {
    return (
        <div className="w-full max-w-sm rounded-2xl border border-gray-300 bg-white p-5 shadow dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="text-center text-2xl font-extrabold text-neutral-900 dark:text-neutral-100">
                {title}
            </h2>
            <p className="mt-1 text-center text-sm text-neutral-500 dark:text-neutral-400">
                {description}
            </p>

            {children}

        </div>
    )
}

export default AuthFormWrapper