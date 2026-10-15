import React, { useEffect, useState } from "react";
import {
  Users,
  MessageSquare,
  Calendar,
  Globe,
  Shield,
  Search,
  MoreHorizontal,
  PodcastIcon,
} from "lucide-react";
import { Post } from "@/libs/types";
import { PostFeedSkeleton } from "../laoding-skeletons";
import QuestionCard from "../question-card";
import { EmptyState } from "@/components/shared/ui";

/* ----------------------------------------------------------------- */
/*  Shared initials avatar — same pattern as ProfileDropdown         */
/* ----------------------------------------------------------------- */

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Avatar({
  name,
  size = "h-10 w-10",
  textSize = "text-sm",
  color = "bg-indigo-600",
}: {
  name: string;
  size?: string;
  textSize?: string;
  color?: string;
}) {
  return (
    <div
      className={`flex ${size} shrink-0 items-center justify-center rounded-full ${color} font-semibold text-white ${textSize}`}
    >
      {getInitials(name)}
    </div>
  );
}

/* ----------------------------------------------------------------- */
/*  ABOUT TAB                                                        */
/* ----------------------------------------------------------------- */

interface Moderator {
  id: string;
  name: string;
  role: string;
}

interface Stat {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}

const STATS: Stat[] = [
  { icon: Users, label: "Members", value: "12,450" },
  { icon: MessageSquare, label: "Posts this week", value: "86" },
  { icon: Calendar, label: "Created", value: "Sept 14, 2023" },
  { icon: Globe, label: "Visibility", value: "Public" },
];

const MODERATORS: Moderator[] = [
  { id: "1", name: "Dr. Amara Bekele", role: "Faculty Moderator" },
  { id: "2", name: "Daniel Kim", role: "Student Moderator" },
  { id: "3", name: "Priya Shah", role: "Student Moderator" },
];

const RULES = [
  {
    title: "No direct answer sharing for active coursework",
    detail:
      "Help with concepts and approach, but don't post full solutions to assignments that are still open.",
  },
  {
    title: "Keep discussions academic and respectful",
    detail:
      "Disagreements are fine — personal attacks, harassment, or off-topic arguments aren't.",
  },
  {
    title: "Format code blocks properly",
    detail:
      "Use triple backticks for code so it's readable. Unformatted code walls get removed.",
  },
];

export function AboutTab() {
  return (
    <div className="space-y-4">
      {/* Description */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6">
        <h3 className="font-semibold text-neutral-900">About r/ComputerScience</h3>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600">
          A space for CS students to ask questions, share resources, and get
          unstuck together. Whether you&apos;re debugging your first recursive
          function or prepping for a systems interview, this is the place to
          post it. Moderated by university research assistants and faculty to
          keep answers accurate and discussions on-topic.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STATS.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="rounded-2xl border border-neutral-200 bg-white p-4"
          >
            <Icon className="h-4 w-4 text-indigo-500" />
            <div className="mt-2 text-lg font-bold text-neutral-900">
              {value}
            </div>
            <div className="text-xs text-neutral-400">{label}</div>
          </div>
        ))}
      </div>

      {/* Moderators */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-indigo-500" />
          <h3 className="font-semibold text-neutral-900">Moderators</h3>
        </div>
        <div className="mt-4 space-y-3">
          {MODERATORS.map((mod) => (
            <div key={mod.id} className="flex items-center gap-3">
              <Avatar name={mod.name} size="h-9 w-9" />
              <div>
                <div className="text-sm font-semibold text-neutral-900">
                  {mod.name}
                </div>
                <div className="text-xs text-neutral-400">{mod.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rules, with detail text (richer than the sidebar's short version) */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6">
        <h3 className="font-semibold text-neutral-900">Community Rules</h3>
        <ol className="mt-4 space-y-4">
          {RULES.map((rule, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600">
                {i + 1}
              </span>
              <div>
                <div className="text-sm font-semibold text-neutral-900">
                  {rule.title}
                </div>
                <div className="mt-0.5 text-sm leading-relaxed text-neutral-500">
                  {rule.detail}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- */
/*  MEMBERS TAB                                                      */
/* ----------------------------------------------------------------- */

interface Member {
  id: string;
  name: string;
  school: string;
  role: "moderator" | "member";
  joined: string;
  avatarColor: string;
}

const MEMBERS: Member[] = [
  {
    id: "1",
    name: "Dr. Amara Bekele",
    school: "Stanford University",
    role: "moderator",
    joined: "Sept 2023",
    avatarColor: "bg-indigo-600",
  },
  {
    id: "2",
    name: "Daniel Kim",
    school: "UCLA",
    role: "moderator",
    joined: "Sept 2023",
    avatarColor: "bg-emerald-600",
  },
  {
    id: "3",
    name: "Priya Shah",
    school: "UC Berkeley",
    role: "moderator",
    joined: "Oct 2023",
    avatarColor: "bg-amber-600",
  },
  {
    id: "4",
    name: "Marcus Aurelius",
    school: "MIT",
    role: "member",
    joined: "Nov 2023",
    avatarColor: "bg-rose-600",
  },
  {
    id: "5",
    name: "Sophia Martinez",
    school: "Stanford University",
    role: "member",
    joined: "Jan 2024",
    avatarColor: "bg-sky-600",
  },
  {
    id: "6",
    name: "Ethan Wright",
    school: "MIT",
    role: "member",
    joined: "Feb 2024",
    avatarColor: "bg-violet-600",
  },
];

function RoleBadge({ role }: { role: Member["role"] }) {
  if (role === "moderator") {
    return (
      <span className="flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600">
        <Shield className="h-3 w-3" />
        Moderator
      </span>
    );
  }
  return (
    <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-500">
      Member
    </span>
  );
}

export function MembersTab() {
  const [query, setQuery] = useState("");

  const filtered = MEMBERS.filter((m) =>
    m.name.toLowerCase().includes(query.toLowerCase())
  );
  const moderators = filtered.filter((m) => m.role === "moderator");
  const members = filtered.filter((m) => m.role === "member");

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search members..."
            className="w-full rounded-xl border border-neutral-200 py-2.5 pl-10 pr-4 text-sm text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Moderators */}
      {moderators.length > 0 && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-2">
          <p className="px-4 pt-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">
            Moderators · {moderators.length}
          </p>
          <div className="mt-1 divide-y divide-neutral-100">
            {moderators.map((m) => (
              <MemberRow key={m.id} member={m} />
            ))}
          </div>
        </div>
      )}

      {/* Members */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-2">
        <p className="px-4 pt-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">
          Members · {members.length}
        </p>
        <div className="mt-1 divide-y divide-neutral-100">
          {members.length > 0 ? (
            members.map((m) => <MemberRow key={m.id} member={m} />)
          ) : (
            <p className="px-4 py-6 text-center text-sm text-neutral-400">
              No members match {query}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function MemberRow({ member }: { member: Member }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Avatar name={member.name} color={member.avatarColor} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-neutral-900">
          {member.name}
        </div>
        <div className="truncate text-xs text-neutral-400">
          {member.school} · Joined {member.joined}
        </div>
      </div>
      <RoleBadge role={member.role} />
      <button className="shrink-0 rounded-lg p-1.5 text-neutral-300 hover:bg-neutral-50 hover:text-neutral-500">
        <MoreHorizontal className="h-4 w-4" />
      </button>
    </div>
  );
}

export function PostsTab({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return <EmptyPostsFallback />;

  return (
    <>
      {posts.map((post) => (
        <QuestionCard key={post.id} post={post} />
      ))}
    </>
  );
}

function EmptyPostsFallback() {
  const [showEmptyState, setShowEmptyState] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setShowEmptyState(true), 2000);
    return () => window.clearTimeout(timeout);
  }, []);

  if (!showEmptyState) {
    return <PostFeedSkeleton />;
  }

  return (
    <EmptyState
      icon={PodcastIcon}
      title="No posts to show"
      text="No posts found"
    />
  );
}