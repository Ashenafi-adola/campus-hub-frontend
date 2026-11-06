"use client";

import { Bookmark, Home, Plus, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

type Tab = {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    href: string;
    /** The centre action gets its own look */
    primary?: boolean;
};

const TABS: Tab[] = [
    { id: "home", label: "Home", icon: Home, href: "/" },
    { id: "communities", label: "Communities", icon: Users, href: "/communities" },
    { id: "new", label: "New", icon: Plus, href: "/posts/new", primary: true },
    { id: "popular", label: "Popular", icon: TrendingUp, href: "/populars" },
    { id: "saved", label: "Saved", icon: Bookmark, href: "/bookmarks" },
];

type Props = {
    /**
     * Open the create-post modal instead of navigating to /posts/new.
     * When omitted, the centre button is a normal link.
     */
    onCreatePost?: () => void;
    /** Routes where the bar is hidden, e.g. full-screen forms */
    hideOn?: string[];
};

/** Active state comes from the URL, so it survives refreshes and back/forward. */
function isActive(pathname: string, href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
}

const focusRing =
    "focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-500";

function MobileFooter({ onCreatePost, hideOn = ["/posts/new"] }: Props) {
    const pathname = usePathname();

    if (hideOn.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
        return null;
    }

    return (
        // lg:hidden matches the desktop sidebar breakpoint, so tablets always have navigation
        <nav
            aria-label="Primary"
            className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-white/80 lg:hidden dark:border-neutral-800 dark:bg-neutral-950/95 dark:supports-[backdrop-filter]:bg-neutral-950/80"
        >
            <ul className="mx-auto grid max-w-md grid-cols-5">
                {TABS.map((tab) => {
                    const { id, label, icon: Icon, href, primary } = tab;
                    const active = !primary && isActive(pathname, href);

                    if (primary) {
                        const inner = (
                            <>
                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md shadow-indigo-600/30 transition-transform group-active:scale-90">
                                    <Icon className="h-5 w-5" strokeWidth={2.5} />
                                </span>
                                <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-300">
                                    {label}
                                </span>
                            </>
                        );
                        const cls = `group flex min-h-14 w-full flex-col items-center justify-center gap-0.5 ${focusRing}`;

                        return (
                            <li key={id} className="flex">
                                {onCreatePost ? (
                                    <button
                                        type="button"
                                        onClick={onCreatePost}
                                        aria-label="Create a post"
                                        className={cls}
                                    >
                                        {inner}
                                    </button>
                                ) : (
                                    <Link href={href} aria-label="Create a post" className={cls}>
                                        {inner}
                                    </Link>
                                )}
                            </li>
                        );
                    }

                    return (
                        <li key={id} className="flex">
                            <Link
                                href={href}
                                aria-current={active ? "page" : undefined}
                                className={`group relative flex min-h-14 w-full flex-col items-center justify-center gap-0.5 transition-colors active:bg-neutral-100 dark:active:bg-neutral-900 ${focusRing} ${
                                    active
                                        ? "text-indigo-600 dark:text-indigo-400"
                                        : "text-neutral-500 dark:text-neutral-400"
                                }`}
                            >
                                {/* LinkedIn-style indicator on the top edge */}
                                {active && (
                                    <span className="absolute inset-x-4 top-0 h-0.5 rounded-b-full bg-indigo-600 dark:bg-indigo-400" />
                                )}
                                <Icon
                                    className="h-6 w-6 transition-transform group-active:scale-90"
                                    strokeWidth={active ? 2.5 : 2}
                                />
                                <span
                                    className={`max-w-full truncate px-0.5 text-[11px] leading-tight ${
                                        active ? "font-semibold" : "font-medium"
                                    }`}
                                >
                                    {label}
                                </span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}

export default MobileFooter;