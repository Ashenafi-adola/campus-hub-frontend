import React from 'react'
import { Bell, Plus, Search } from 'lucide-react'
import ProfileDropdown from './profile-dropdown'
import { AuthUser } from '@/libs/auth/types'


function TopBar({user}:{user:AuthUser}) {
    
    return (
        <header className="sticky top-0 z-10 flex items-center gap-6 border-b border-neutral-200 bg-white px-6 py-3">
            <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="none">
                        <path
                            d="M4 12l8-5 8 5-8 5-8-5z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
                <span className="text-lg font-bold text-neutral-900">CampusHub</span>
            </div>

            <div className="relative mx-auto w-full max-w-md">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                    type="text"
                    placeholder="Search questions, communities, study guides..."
                    className="w-full rounded-full bg-neutral-100 py-2.5 pl-10 pr-4 text-sm text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
            </div>

            <div className="flex shrink-0 items-center gap-4">
                <button className="md:flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 hidden py-2 text-sm font-semibold text-white hover:bg-indigo-700">
                    <Plus className="h-4 w-4" />
                    Ask Question
                </button>
                <button className="text-neutral-500 hover:text-neutral-800">
                    <Bell className="h-5 w-5" />
                </button>
                <ProfileDropdown user={user}/>
            </div>
        </header>
    )
}

export default TopBar