"use client"

import { getCommunities } from '@/libs/api';
import { Community } from '@/libs/types';
import { Bookmark, Clock, HelpCircle, Home, Plus, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'

interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    href: string;
}


const NAV_ITEMS: NavItem[] = [
    { id: "home", label: "Home", icon: Home, href: "/" },
    { id: "popular", label: "Popular", icon: TrendingUp, href: "/populars" },
    { id: "questions", label: "Questions", icon: HelpCircle, href: "/questions" },
    { id: "communities", label: "Communities", icon: Users, href: "/communities" },
    { id: "saved", label: "Saved", icon: Bookmark, href: "/bookmarks" },
    { id: "activity", label: "My Activity", icon: Clock, href: "/u/activity" },
    { id: "new community", label: "New Community", icon: Plus, href: "/communities/create" }
];

function SideBar() {
    const [active, setActive] = useState<string>("home");
    const [myCommunities, setMyCommunities] = useState<Community[]>([]);

    useEffect(() => {
        getCommunities(undefined, true)
            .then(res => setMyCommunities(res))
            .catch(error => console.log(error))
    }, [])
    return (
        <aside className="sticky top-16 z-0 h-[calc(100dvh-4rem)] w-56 shrink-0 self-start space-y-6 overflow-y-auto border-r border-gray-300 transition-all hidden md:block dark:border-neutral-800">
            <nav className="space-y-1">
                {NAV_ITEMS.map(({ id, label, icon: Icon, href }) => {
                    const isActive = active === id;
                    return (
                        <Link
                            href={href}
                            key={id}
                            onClick={() => setActive(id)}
                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
                                : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                }`}
                        >
                            <Icon className="h-4 w-4" />
                            {label}
                        </Link>
                    );
                })}
            </nav>

            <div>
                <p className="px-3 text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                    My Communities
                </p>
                <div className="mt-2 space-y-1">
                    {myCommunities.map((c) => {
                        return <Link
                            href={`/communities/${c.slug}`}
                            key={c.id}
                            className="flex w-full items-center gap-3 justify-start rounded-xl px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                        >
                            <span className={`h-2.5 w-2.5 rounded-full`} style={{ backgroundColor: c.color}} />
                            <span className='w-50 truncate text-start'>c/{c.name.replace(" ", "")}</span>
                        </Link>
                    })}
                </div>
            </div>
        </aside>
    )
}

export default SideBar