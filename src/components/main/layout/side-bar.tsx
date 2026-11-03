"use client"

import { getCommunities } from '@/libs/api';
import { Community } from '@/libs/types';
import { Bookmark, Clock, HelpCircle, Home, Plus, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import React, { useContext, useEffect, useState } from 'react'
import { MENU_ITEMS } from './profile-dropdown';
import { AuthContext } from '@/context/auth-context';

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

function SideBar({ onClose, mobile = false }: { onClose?: () => void; mobile?: boolean }) {
    const [active, setActive] = useState<string>("home");
    const [myCommunities, setMyCommunities] = useState<Community[]>([]);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        getCommunities(undefined, true)
            .then(res => setMyCommunities(res))
            .catch(error => console.log(error))
    }, [])

    const handleNavClick = (id: string) => {
        setActive(id)
        onClose?.()
    }

    return (
        <aside
            onClick={(e) => e.stopPropagation()}
            className={`${mobile
                ? "h-screen w-56 bg-white dark:bg-neutral-950"
                : "sticky top-16 z-0 h-[calc(100dvh-4rem)] transition-all hidden lg:block dark:border-neutral-800"
                } shrink-0 self-start pl-3 space-y-6 w-80 overflow-y-auto border-r border-gray-300 dark:border-neutral-700`}
        >
            <nav className="space-y-1 ">
                <div className="space-y-1 hidden md:block">
                    {NAV_ITEMS.map(({ id, label, icon: Icon, href }) => {
                        const isActive = active === id;
                        return (
                            <Link
                                href={href}
                                key={id}
                                onClick={() => handleNavClick(id)}
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
                </div>
                <div className="space-y-1 md:hidden">
                    <div className="py-1.5">
                        {MENU_ITEMS.map(({ id, label, icon: Icon }) => (
                        <Link
                            href={id}
                            key={id}
                            onClick={()=>{}}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800"
                        >
                            <Icon className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
                            {label}
                        </Link>
                        ))}
                    </div>
                </div>
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

            <div className="flex absolute bottom-17 md:bottom-0 items-center gap-3 border-b border-neutral-100 px-4 py-3.5 dark:border-neutral-700">
                {user.profile.avatar ? <Image
                    width={32}
                    height={32}
                    src={typeof(user.profile.avatar) === 'string' ? user.profile.avatar : URL.createObjectURL(user.profile.avatar)}
                    alt={user.username}
                    unoptimized
                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                /> : <div>{user.profile?.first_name ? user.profile?.first_name.slice(0, 1) : "NN"}</div>}
                <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {user.profile?.first_name + " " + user.profile?.last_name}
                    </div>
                    <div className="truncate text-xs text-neutral-400 dark:text-neutral-400">
                        {user.email}
                    </div>
                </div>
            </div>
        </aside>
    )
}

export default SideBar