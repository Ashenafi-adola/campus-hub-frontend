"use client"
import { AuthUser } from "@/libs/auth/types";
import { Bookmark, ChevronDown, Clock, HelpCircle, LogOut, Moon, Settings, User } from "lucide-react";
import Image from "next/image";
import { use, useEffect, useRef, useState } from "react";


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


function ProfileDropdown({user}:{user:AuthUser}) {
  const [open, setOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2 hover:bg-neutral-100"
      >
        <Image
          width={32}
          height={32}
          src={user.avatar || AVATAR}
          alt={user.username}
          unoptimized
          className="h-8 w-8 rounded-full object-cover"
        />
        <ChevronDown
          className={`h-4 w-4 text-neutral-400 transition-transform ${open ? "rotate-180" : ""
            }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-64 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-gray-700 shadow-2xl">
          {/* Identity header */}
          <div className="flex items-center gap-3 border-b border-neutral-100 px-4 py-3.5">
            {user.avatar ? <Image
              width={32}
              height={32}
              src={user.avatar || AVATAR}
              alt={user.username}
              unoptimized
              className="h-10 w-10 shrink-0 rounded-full object-cover"
            /> : <div>{user.first_name.slice(0,1)}</div>}
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-neutral-900">
                {user.first_name + " " + user.last_name}
              </div>
              <div className="truncate text-xs text-neutral-400">
                {user.email}
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1.5">
            {MENU_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                <Icon className="h-4 w-4 text-neutral-400" />
                {label}
              </button>
            ))}
          </div>

          {/* Dark mode toggle */}
          <div className="border-t border-neutral-100 px-4 py-3">
            <button
              onClick={() => setDarkMode((v) => !v)}
              className="flex w-full items-center justify-between"
            >
              <span className="flex items-center gap-3 text-sm font-medium text-neutral-700">
                <Moon className="h-4 w-4 text-neutral-400" />
                Dark mode
              </span>
              <span
                className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${darkMode ? "bg-indigo-600" : "bg-neutral-200"
                  }`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${darkMode ? "translate-x-0.4" : "-translate-x-4"
                    }`}
                />
              </span>
            </button>
          </div>

          {/* Log out */}
          <div className="border-t border-neutral-100 py-1.5">
            <button
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
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