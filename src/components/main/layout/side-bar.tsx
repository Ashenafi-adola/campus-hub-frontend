"use client"

import { getCommunities } from '@/libs/api';
import { Community } from '@/libs/types';
import { getInitials } from '@/libs/format';
import {
    Bookmark,
    ChevronDown,
    Clock,
    HelpCircle,
    Home,
    LogOut,
    Moon,
    Plus,
    TrendingUp,
    Users,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { MENU_ITEMS } from './profile-dropdown';
import { AuthContext } from '@/context/auth-context';
import { ThemeContext } from '@/context/theme-context';

interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    href: string;
}

// "New Community" moved to a + button next to "My Communities"
export const NAV_ITEMS: NavItem[] = [
    { id: "home", label: "Home", icon: Home, href: "/" },
    { id: "popular", label: "Popular", icon: TrendingUp, href: "/populars" },
    { id: "questions", label: "Questions", icon: HelpCircle, href: "/questions" },
    { id: "communities", label: "Communities", icon: Users, href: "/communities" },
    { id: "saved", label: "Saved", icon: Bookmark, href: "/bookmarks" },
    { id: "activity", label: "My Activity", icon: Clock, href: "/u/activity/me" },
];

// Account links shown in the mobile drawer. Profile is the header card and
// Saved / My Activity are already in the main list, so they're left out here.
const ACCOUNT_LINKS = MENU_ITEMS.filter((i) => ["settings", "help"].includes(i.id));

const MOBILE_COMMUNITY_PREVIEW = 5;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/**
 * Active state comes from the URL, not local state, so it survives refreshes
 * and back/forward. The longest matching href wins, so /communities/create
 * doesn't light up both items.
 */
export function isRouteActive(pathname: string, href: string, all: string[]) {
    if (href === "/") return pathname === "/";
    const matches = all
        .filter((h) => h !== "/" && (pathname === h || pathname.startsWith(h + "/")))
        .sort((a, b) => b.length - a.length);
    return matches[0] === href;
}

/** Avatar can be a URL or a File (right after an upload). Create and revoke the blob URL safely. */
function useAvatarUrl(avatar?: string | File | null) {
    const [url, setUrl] = useState<string | null>(typeof avatar === "string" ? avatar : null);

    useEffect(() => {
        if (!avatar) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setUrl(null);
            return;
        }
        if (typeof avatar === "string") {
            setUrl(avatar);
            return;
        }
        const objectUrl = URL.createObjectURL(avatar);
        setUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [avatar]);

    return url;
}

export function useCurrentUserDisplay() {
    const { user } = useContext(AuthContext);
    const first = user?.profile?.first_name;
    const last = user?.profile?.last_name;
    const name = [first, last].filter(Boolean).join(" ") || user?.username || "Your account";
    return { user, name, email: user?.email as string | undefined };
}

export function UserAvatar({ size = 40 }: { size?: number }) {
    const { user, name } = useCurrentUserDisplay();
    const url = useAvatarUrl(user?.profile?.avatar);
    const dim = { width: size, height: size };

    if (url) {
        return (
            <Image
                src={url}
                alt={name}
                width={size}
                height={size}
                unoptimized
                style={dim}
                className="shrink-0 rounded-full object-cover"
            />
        );
    }
    return (
        <div
            style={{ ...dim, fontSize: size * 0.38 }}
            className="flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 font-semibold text-white"
        >
            {getInitials(name)}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Communities                                                        */
/* ------------------------------------------------------------------ */

type CommunitiesState =
    | { status: "loading" }
    | { status: "error" }
    | { status: "ready"; items: Community[] };

function useMyCommunities() {
    const [state, setState] = useState<CommunitiesState>({ status: "loading" });

    const load = useCallback(() => {
        let cancelled = false;
        setState({ status: "loading" });
        getCommunities(undefined, true)
            .then((items) => !cancelled && setState({ status: "ready", items }))
            .catch(() => !cancelled && setState({ status: "error" }));
        return () => {
            cancelled = true;
        };
    }, []);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => load(), [load]);

    return { state, retry: load };
}

function CommunityRow({
    c,
    onNavigate,
    tall = false,
}: {
    c: Community;
    onNavigate?: () => void;
    tall?: boolean;
}) {
    const pathname = usePathname();
    const href = `/communities/${c.slug}`;
    const active = pathname === href || pathname.startsWith(href + "/");

    return (
        <Link
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`flex w-full items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors ${tall ? "py-3" : "py-2"
                } ${active
                    ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50"
                    : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                }`}
        >
            <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: c.color }}
            />
            <span className="min-w-0 flex-1 truncate text-start">
                c/{c.name.replace(/\s+/g, "")}
            </span>
        </Link>
    );
}

function CommunitiesList({
    onNavigate,
    limit,
    tall,
}: {
    onNavigate?: () => void;
    /** Collapse to this many rows with a "Show all" toggle */
    limit?: number;
    tall?: boolean;
}) {
    const { state, retry } = useMyCommunities();
    const [showAll, setShowAll] = useState(false);

    if (state.status === "loading") {
        return (
            <div className="space-y-1 px-3 pt-1" aria-busy="true">
                {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 py-2">
                        <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800" />
                        <div className="h-3.5 flex-1 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
                    </div>
                ))}
            </div>
        );
    }

    if (state.status === "error") {
        return (
            <div className="px-3 py-2 text-sm text-neutral-500 dark:text-neutral-400">
                Couldn&apos;t load your communities.{" "}
                <button
                    onClick={retry}
                    className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (state.items.length === 0) {
        return (
            <div className="px-3 py-2 text-sm text-neutral-500 dark:text-neutral-400">
                You haven&apos;t joined any communities yet.{" "}
                <Link
                    href="/communities"
                    onClick={onNavigate}
                    className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                    Browse communities
                </Link>
            </div>
        );
    }

    const items =
        limit && !showAll ? state.items.slice(0, limit) : state.items;
    const hiddenCount = limit ? state.items.length - limit : 0;

    return (
        <div className="space-y-0.5">
            {items.map((c) => (
                <CommunityRow key={c.id} c={c} onNavigate={onNavigate} tall={tall} />
            ))}
            {hiddenCount > 0 && (
                <button
                    onClick={() => setShowAll((v) => !v)}
                    className="flex w-full items-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100"
                >
                    {showAll ? "Show less" : `Show all ${state.items.length}`}
                    <ChevronDown
                        className={`h-4 w-4 transition-transform ${showAll ? "rotate-180" : ""}`}
                    />
                </button>
            )}
        </div>
    );
}

function CommunitiesHeader({
    onNavigate,
    collapsed,
    onToggle,
}: {
    onNavigate?: () => void;
    collapsed?: boolean;
    onToggle?: () => void;
}) {
    const label = (
        <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
            My Communities
        </span>
    );
    return (
        <div className="flex items-center justify-between px-3">
            {onToggle ? (
                <button
                    onClick={onToggle}
                    aria-expanded={!collapsed}
                    className="flex items-center gap-1.5"
                >
                    {label}
                    <ChevronDown
                        className={`h-3.5 w-3.5 text-neutral-400 transition-transform ${collapsed ? "-rotate-90" : ""}`}
                    />
                </button>
            ) : (
                label
            )}
            <Link
                href="/communities/create"
                onClick={onNavigate}
                aria-label="Create a community"
                title="Create a community"
                className="rounded-full p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-indigo-600 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-indigo-400"
            >
                <Plus className="h-4 w-4" />
            </Link>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Mobile drawer content (LinkedIn style)                             */
/* ------------------------------------------------------------------ */

function DarkModeRow() {
    const themeContext = useContext(ThemeContext);
    if (!themeContext) return null;
    const [isDark, toggleTheme] = themeContext;

    return (
        <button
            type="button"
            role="switch"
            aria-checked={isDark}
            onClick={() => toggleTheme()}
            className="flex w-full items-center justify-between px-4 py-3.5 text-left"
        >
            <span className="flex items-center gap-4 text-[15px] font-medium text-neutral-800 dark:text-neutral-100">
                <Moon className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
                Dark mode
            </span>
            <span
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${isDark ? "bg-indigo-600" : "bg-neutral-200 dark:bg-neutral-700"
                    }`}
            >
                <span
                    className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${isDark ? "translate-x-5" : ""
                        }`}
                />
            </span>
        </button>
    );
}

function MobileDrawerContent({ onClose }: { onClose?: () => void }) {
    const pathname = usePathname();
    const router = useRouter();
    const { name, email } = useCurrentUserDisplay();
    const [communitiesOpen, setCommunitiesOpen] = useState(true);
    const hrefs = NAV_ITEMS.map((n) => n.href);

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        onClose?.();
        router.replace("/signin");
        router.refresh();
    };

    const divider = <div className="h-2 bg-neutral-100 dark:bg-neutral-900" />;

    return (
        <aside
        onClick={(e)=>e.stopPropagation()}
        className="flex h-full w-80 flex-col bg-white dark:bg-neutral-950">
            {/* Profile card */}
            <Link
                href="/u/profile"
                onClick={onClose}
                className="flex items-center gap-3.5 px-4 pb-4 pt-[max(1.25rem,env(safe-area-inset-top))]"
            >
                <UserAvatar size={56} />
                <div className="min-w-0">
                    <div className="truncate text-base font-bold text-neutral-900 dark:text-neutral-50">
                        {name}
                    </div>
                    {email && (
                        <div className="truncate text-sm text-neutral-500 dark:text-neutral-400">
                            {email}
                        </div>
                    )}
                    <div className="mt-0.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        View profile
                    </div>
                </div>
            </Link>

            {divider}

            <div className="flex-1 overflow-y-auto overscroll-contain">
                {/* Main navigation */}
                <nav aria-label="Main" className="py-1">
                    {MENU_ITEMS.map(({ id, label, icon: Icon }) => {
                        const active = isRouteActive(pathname, id, hrefs);
                        return (
                            <Link
                                key={id}
                                href={id}
                                onClick={onClose}
                                aria-current={active ? "page" : undefined}
                                className={`flex min-h-12 items-center gap-4 border-l-4 px-4 text-[15px] font-medium transition-colors ${active
                                    ? "border-indigo-600 bg-indigo-50/70 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950/40 dark:text-indigo-300"
                                    : "border-transparent text-neutral-800 active:bg-neutral-100 dark:text-neutral-100 dark:active:bg-neutral-800"
                                    }`}
                            >
                                <Icon
                                    className={`h-5 w-5 ${active ? "" : "text-neutral-500 dark:text-neutral-400"}`}
                                />
                                {label}
                            </Link>
                        );
                    })}
                </nav>

                {divider}

                {/* Communities */}
                <section className="py-3">
                    <CommunitiesHeader
                        onNavigate={onClose}
                        collapsed={!communitiesOpen}
                        onToggle={() => setCommunitiesOpen((v) => !v)}
                    />
                    {communitiesOpen && (
                        <div className="mt-1.5 px-1">
                            <CommunitiesList
                                onNavigate={onClose}
                                limit={MOBILE_COMMUNITY_PREVIEW}
                                tall
                            />
                        </div>
                    )}
                </section>

                {divider}

                {/* Account */}
                <div className="py-1">
                    {ACCOUNT_LINKS.map(({ id, label, icon: Icon }) => (
                        <Link
                            key={id}
                            href={`/u/${id}`}
                            onClick={onClose}
                            className="flex min-h-12 items-center gap-4 px-4 text-[15px] font-medium text-neutral-800 active:bg-neutral-100 dark:text-neutral-100 dark:active:bg-neutral-800"
                        >
                            <Icon className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
                            {label}
                        </Link>
                    ))}
                    <DarkModeRow />
                </div>
            </div>

            {/* Sign out */}
            <div className="shrink-0 border-t border-neutral-200 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 dark:border-neutral-800">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-neutral-700 dark:text-red-400 dark:hover:bg-red-500/10"
                >
                    <LogOut className="h-4 w-4" />
                    Log out
                </button>
            </div>
        </aside>
    );
}

/* ------------------------------------------------------------------ */
/*  Desktop sidebar                                                    */
/* ------------------------------------------------------------------ */

function DesktopSideBar() {
    const pathname = usePathname();
    const { name, email } = useCurrentUserDisplay();
    const hrefs = NAV_ITEMS.map((n) => n.href);

    return (
        <aside className="sticky top-16 z-0 hidden h-[calc(100dvh-4rem)] w-80 shrink-0 self-start flex-col border-r border-neutral-200 dark:border-neutral-800 lg:flex">
            {/* Scrollable area */}
            <div className="flex-1 space-y-6 overflow-y-auto px-3 pt-1">
                <nav aria-label="Main" className="space-y-1">
                    {NAV_ITEMS.map(({ id, label, icon: Icon, href }) => {
                        const active = isRouteActive(pathname, href, hrefs);
                        return (
                            <Link
                                href={href}
                                key={id}
                                aria-current={active ? "page" : undefined}
                                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 ${active
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

                <section>
                    <CommunitiesHeader />
                    <div className="mt-2">
                        <CommunitiesList />
                    </div>
                </section>
            </div>

            {/* Pinned user card */}
            <Link
                href="/u/profile"
                className="flex shrink-0 items-center gap-3 border-t border-neutral-100 px-4 py-3.5 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
            >
                <UserAvatar size={40} />
                <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {name}
                    </div>
                    {email && (
                        <div className="truncate text-xs text-neutral-400 dark:text-neutral-500">
                            {email}
                        </div>
                    )}
                </div>
            </Link>
        </aside>
    );
}

/* ------------------------------------------------------------------ */
/*  Public component (same props as before)                            */
/* ------------------------------------------------------------------ */

function SideBar({ onClose, mobile = false }: { onClose?: () => void; mobile?: boolean }) {
    return mobile ? <MobileDrawerContent onClose={onClose} /> : <DesktopSideBar />;
}

export default SideBar