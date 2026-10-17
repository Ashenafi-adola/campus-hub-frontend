import React from 'react'
import { LucideIcon } from 'lucide-react'

type Props = {
    label?: string
    type?: string
    value?: string
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
    placeholder?: string
    Icon?: LucideIcon
    error?: string
}

function Input({
    label = 'Email',
    type = 'text',
    value,
    onChange,
    placeholder = '',
    Icon,
    error,
}: Props) {
    return (
        <div>
            <div className="mb-1.5 flex items-center justify-between">
                <label className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                    {label}
                </label>
            </div>
            <div className="relative">
                {
                    Icon && <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
                }
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`w-full rounded-xl border bg-white py-2.5 ${ Icon ? "pl-10": "pl-5"} pr-3.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 ${error ? "border-red-300 focus:border-red-500 focus:ring-red-500/20 dark:border-red-800" : "border-neutral-200 focus:border-indigo-500 dark:border-neutral-700"}`}
                />
            </div>
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    )
}

export default Input