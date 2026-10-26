"use client"
import React, { useState } from 'react'
import { Bell, Plus, Search } from 'lucide-react'
import ProfileDropdown from './profile-dropdown'
import Link from 'next/link'
import SideBar from './side-bar'


function SiteHeader() {
    const [openSideBar, setOpenSideBar] = useState(false)

    const closeSideBar = () => setOpenSideBar(false)

    return (
        <header className="sticky top-0 z-80 flex items-center gap-6 border-b border-neutral-200 bg-white px-6 py-3 dark:border-neutral-800 dark:bg-neutral-900">
            <div
                onClick={closeSideBar}
                className={`fixed inset-x-0 top-16 bottom-0 z-40 bg-black/10 backdrop-blur-[2px] transition-all duration-300 md:hidden ${!openSideBar ? "hidden" : "block"}`}
            >
                <SideBar mobile onClose={closeSideBar} />
            </div>

            <div className="flex items-center gap-2">
                <div className="md:flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 hidden">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="none">
                        <path
                            d="M4 12l8-5 8 5-8 5-8-5z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
                <button
                    aria-label="Toggle sidebar"
                    aria-expanded={openSideBar}
                    onClick={() => setOpenSideBar(prev => !prev)}
                    className="hover:cursor-pointer md:hidden dark:text-gray-400"
                >
                    <svg viewBox="0 0 24 24" width="24" height="24">
                        <path fill="currentColor" d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-16z" />
                    </svg>
                </button>
                <Link href="/" className="text-lg font-bold text-neutral-900 dark:text-neutral-100">CampusHub</Link>
            </div>

            <div className="relative mx-auto w-full max-w-md">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
                <input
                    type="text"
                    placeholder="Search questions, communities, study guides..."
                    className="w-full rounded-full bg-neutral-100 py-2.5 pl-10 pr-4 text-sm text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
                />
            </div>

            <div className="flex shrink-0 items-center gap-4">
                <Link href={`/posts/new`} className="md:flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 hidden py-2 text-sm font-semibold text-white hover:bg-indigo-700">
                    <Plus className="h-4 w-4" />
                    Ask Question
                </Link>
                <button aria-label="Notifications" className="text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100">
                    <Bell className="h-5 w-5" />
                </button>
                <ProfileDropdown/>
            </div>
        </header>
    )
}

export default SiteHeader;