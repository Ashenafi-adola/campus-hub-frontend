"use client"
import { AuthContext } from "@/context/auth-context";
import { ThemeContext } from "@/context/theme-context";
import { Bookmark, ChevronDown, Clock, HelpCircle, LogOut, Moon, Settings, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";


interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  danger?: boolean;
}

const MENU_ITEMS: MenuItem[] = [
  { id: "profile", label: "View Profile", icon: User },
  { id: "saved", label: "Saved", icon: Bookmark },
  { id: "activity", label: "My Activity", icon: Clock },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "help", label: "Help & Support", icon: HelpCircle },
];

const AVATAR =
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=64&h=64&fit=crop&crop=faces";


function ProfileDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter()
  const { user } = useContext(AuthContext);
  const themeContext = useContext(ThemeContext);
  if (!themeContext) throw new Error("ProfileDropdown must be inside ThemeProvider");
  const [isDark, toggleTheme] = themeContext;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/signin");
    router.refresh();
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((currentOpen) => !currentOpen)}
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2 hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800"
      >
        <Image
          width={32}
          height={32}
          src={user?.avatar || AVATAR}
          alt={""}
          unoptimized
          className="h-8 w-8 rounded-full object-cover"
        />
        <ChevronDown
          className={`h-4 w-4 text-neutral-400 transition-transform dark:text-neutral-500 ${open ? "rotate-180" : ""
            }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-80 mt-2 w-64 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl shadow-gray-700 dark:border-neutral-700 dark:bg-neutral-900 dark:shadow-indigo-800">
          {/* Identity header */}
          <div className="flex items-center gap-3 border-b border-neutral-100 px-4 py-3.5 dark:border-neutral-700">
            {user?.avatar ? <Image
              width={32}
              height={32}
              src={user?.avatar || AVATAR}
              alt={user.username}
              unoptimized
              className="h-10 w-10 shrink-0 rounded-full object-cover"
            /> : <div>{user?.first_name.slice(0, 1)}</div>}
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {user?.first_name + " " + user?.last_name}
              </div>
              <div className="truncate text-xs text-neutral-400 dark:text-neutral-400">
                {user?.email}
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1.5">
            {MENU_ITEMS.map(({ id, label, icon: Icon }) => (
              <Link
                href={`/u/${id}`}
                key={id}
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                <Icon className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
                {label}
              </Link>
            ))}
          </div>

          {/* Dark mode toggle */}
          <div className="border-t border-neutral-100 px-4 py-3 dark:border-neutral-700">
            <button
              onClick={toggleTheme}
              role="switch"
              aria-checked={isDark}
              aria-label="Dark mode"
              className="flex w-full items-center justify-between"
            >
              <span className="flex items-center gap-3 text-sm font-medium text-neutral-700 dark:text-neutral-200">
                <Moon className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
                Dark mode
              </span>
              <span
                className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${isDark ? "bg-indigo-600" : "bg-neutral-200"
                  }`}
              >
                <span
                  className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${isDark ? "translate-x-4" : "translate-x-0"
                    }`}
                />
              </span>
            </button>
          </div>

          {/* Log out */}
          <div className="border-t border-neutral-100 py-1.5 dark:border-neutral-700">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileDropdown;