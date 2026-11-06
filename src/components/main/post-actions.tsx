import React, { useContext, useEffect, useRef, useState } from "react";
import {
  MoreHorizontal,
  Link2,
  Flag,
  Pencil,
  Trash2,
  Pin,
  BellOff,
  EyeOff,
  Check,
} from "lucide-react";
import { Post } from "@/libs/types";
import { AuthContext } from "@/context/auth-context";
import DeletePostModal from "./posts/delete-modal";
import Link from "next/link";

interface MenuAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  danger?: boolean;
}

/** Actions visible to the post's own author (or a moderator). */
const OWNER_ACTIONS: MenuAction[] = [
  { id: "pin", label: "Pin to top", icon: Pin },
  { id: "edit", label: "Edit post", icon: Pencil },
  { id: "mute", label: "Mute notifications", icon: BellOff },
];

/** Actions visible to everyone. */
const COMMON_ACTIONS: MenuAction[] = [
  { id: "copy-link", label: "Copy link", icon: Link2 },
  { id: "hide", label: "Hide post", icon: EyeOff },
];

const REPORT_ACTION: MenuAction = { id: "report", label: "Report", icon: Flag, danger: true };
const DELETE_ACTION: MenuAction = { id: "delete", label: "Delete post", icon: Trash2, danger: true };

export function PostActionsMenu({ post }: { post: Post }) {
  const [open, setOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false)
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { user } = useContext(AuthContext)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isOwner, setIsOwner] = useState<boolean>(()=>post ? post.author.username === user?.username : false);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAction = (id: string) => {
    if (id === "delete") {
      setOpenModal(true);
    }
    if (id === "copy-link") {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      return; // keep menu open briefly to show the "Copied" state
    }
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <DeletePostModal open={openModal} post={post} onClose={() => setOpenModal(false)}/>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`rounded-lg p-1.5 transition-colors ${
          open ? "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200" : "text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
        }`}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-1.5 w-52 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1.5 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
          {isOwner && (
            <>
              {OWNER_ACTIONS.map((action) => (
                <ActionRow key={action.id} action={action} onClick={handleAction} post={post}/>
              ))}
              <div className="my-1.5 border-t border-neutral-100 dark:border-neutral-800" />
            </>
          )}

          {COMMON_ACTIONS.map((action) => (
            <ActionRow key={action.id} action={action} onClick={handleAction} />
          ))}

          {/* Copy link gets custom feedback state */}
          <button
            onClick={() => handleAction("copy-link")}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-600" strokeWidth={3} />
            ) : (
              <Link2 className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
            )}
            {copied ? "Copied!" : "Copy link"}
          </button>

          <div className="my-1.5 border-t border-neutral-100 dark:border-neutral-800" />

          <ActionRow action={REPORT_ACTION} onClick={handleAction} />
          {isOwner && <ActionRow action={DELETE_ACTION} onClick={handleAction} />}
        </div>
      )}
    </div>
  );
}

export function ActionRow({
  action,
  onClick,
  post,
}: {
  action: MenuAction;
  onClick: (id: string) => void;
  post?: Post;
}) {
  const Icon = action.icon;
  if (action.id === "edit" && post) {
    return (
      <Link
        href={`/posts/${post.id}`}
        onClick={() => onClick(action.id)}
        className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 ${action.danger ? "text-red-600 dark:text-red-400" : "text-neutral-700 dark:text-neutral-200"
          }`}
      >
        <Icon className={`h-4 w-4 ${action.danger ? "text-red-500 dark:text-red-400" : "text-neutral-400 dark:text-neutral-500"}`} />
        {action.label}
      </Link>
    )
  }
  return (
    <button
      onClick={() => onClick(action.id)}
      className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 ${
        action.danger ? "text-red-600 dark:text-red-400" : "text-neutral-700 dark:text-neutral-200"
      }`}
    >
      <Icon className={`h-4 w-4 ${action.danger ? "text-red-500 dark:text-red-400" : "text-neutral-400 dark:text-neutral-500"}`} />
      {action.label}
    </button>
  );
}
