"use client"

import { Bookmark, Clock, HelpCircle, Home, Plus, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react'

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

interface Community {
  id: string;
  name: string;
  color: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Home", icon: Home , href:"/"},
  { id: "popular", label: "Popular", icon: TrendingUp , href:"/popular"},
  { id: "posts", label: "Posts", icon: HelpCircle ,href:"/posts"},
  { id: "communities", label: "Communities", icon: Users, href:"/communities" },
  { id: "saved", label: "Saved", icon: Bookmark ,href:"/bookmarks"},
  { id: "activity", label: "My Activity", icon: Clock ,href:"/myactivities"},
  { id: "new community", label: "New Community", icon: Plus, href:"/communities/create"}
];

const MY_COMMUNITIES: Community[] = [
  { id: "cs", name: "r/ComputerScience", color: "bg-indigo-600" },
  { id: "study", name: "r/StudyTips", color: "bg-emerald-500" },
  { id: "life", name: "r/CampusLife", color: "bg-amber-500" },
];


function SideBar() {
    const [active, setActive] = useState<string>("home");
    return (
        <aside className="sticky top-16 z-0 h-[calc(100dvh-4rem)] w-56 shrink-0 self-start space-y-6 overflow-y-auto border-r border-gray-300 transition-all hidden md:block">
            <nav className="space-y-1">
                {NAV_ITEMS.map(({ id, label, icon: Icon, href }) => {
                    const isActive = active === id;
                    return (
                        <Link
                            href={href}
                            key={id}
                            onClick={() => setActive(id)}
                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                                    ? "bg-indigo-50 text-indigo-700"
                                    : "text-neutral-600 hover:bg-neutral-100"
                                }`}
                        >
                            <Icon className="h-4 w-4" />
                            {label}
                        </Link>
                    );
                })}
            </nav>

            <div>
                <p className="px-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                    My Communities
                </p>
                <div className="mt-2 space-y-1">
                    {MY_COMMUNITIES.map((c) => (
                        <button
                            key={c.id}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
                        >
                            <span className={`h-2.5 w-2.5 rounded-full ${c.color}`} />
                            {c.name}
                        </button>
                    ))}
                </div>
            </div>
        </aside>
    )
}

export default SideBar