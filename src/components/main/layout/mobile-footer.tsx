"use client";
import { Bookmark, Home, Plus, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react'

const NAV_ITEMS = [
    { id: "home", label: "Home", icon: Home, href: "/" },
    { id: "communities", label: "Communities", icon: Users, href: "/communities" },
    { id: "new community", label: "New", icon: Plus, href: "/posts/new" },
    { id: "popular", label: "Popular", icon: TrendingUp, href: "/populars" },
    { id: "saved", label: "Saved", icon: Bookmark, href: "/bookmarks" },
];

function MobileFooter() {
    const [active, setActive] = useState<string | null>(null)
    return (
        <div className="fixed w-full md:h-0 bottom-0 z-80 flex items-center gap-6 transition-all duration-300 border-t border-neutral-200 bg-white px-6 py-1 dark:border-neutral-700 dark:bg-neutral-900">
            <nav className="flex items-center justify-between w-full md:hidden">
                {
                    NAV_ITEMS.map(({ id, label, icon: Icon, href }) => {
                        const isActive = active === id;
                        return (
                            <Link
                                href={href}
                                key={id}
                                onClick={() => setActive(id)}
                                className={`flex-row w-full text-center items-center justify-center rounded-xl px-3 py-2.5 text-xs font-medium transition-colors ${isActive
                                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
                                    : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                    }`}
                            >
                                    <Icon className="flex mx-auto"/>
                                    <span className="text-xs">{label}</span>
                            </Link>
                        )
                    })
                }
            </nav>
        </div>
    )
}

export default MobileFooter