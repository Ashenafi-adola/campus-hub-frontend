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
import { Community, CommunityMemeber, Post } from "@/libs/types";
import { PostFeedSkeleton } from "../laoding-skeletons";
import QuestionCard from "../post-card";
import { Avatar, EmptyState } from "@/components/shared/ui";



interface Stat {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}



export function AboutTab({ community, posts, members } : {community: Community, posts: Post[], members: CommunityMemeber[]}) {

  const postNum = posts.filter((p)=> new Date(p.created_at).getTime() > new Date().getTime() - 1000 * 60 * 60 * 24 * 7).length
  const STATS: Stat[] = [
    { icon: Users, label: "Members", value: community.member_count.toString() },
    { icon: MessageSquare, label: "Posts this week", value: postNum.toLocaleString() },
    { icon: Calendar, label: "Created", value: community.created_at ? new Date(community.created_at).toDateString().slice(3,) : "Sept 14, 2023" },
    { icon: Globe, label: "Visibility", value: community.is_private? "Private" : "Public" },
  ];
  return (
    <div className="space-y-4">
      {/* Description */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">About c/{community.name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
          {community.description || "No description provided."}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STATS.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <Icon className="h-4 w-4 text-indigo-500" />
            <div className="mt-2 text-lg font-bold text-neutral-900 dark:text-neutral-100">
              {value}
            </div>
            <div className="text-xs text-neutral-400 dark:text-neutral-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Moderators */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-indigo-500" />
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Moderators</h3>
        </div>
        <div className="mt-4 space-y-3">
          {members.filter((m)=> m.role === "moderator").map((mod) => (
            <div key={mod.id} className="flex items-center gap-3">
              <Avatar profile={mod.user.profile} />
              <div>
                <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {mod.user.profile.first_name + " " + mod.user.profile.last_name}
                </div>
                <div className="text-xs text-neutral-400 dark:text-neutral-500">{mod.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rules, with detail text (richer than the sidebar's short version) */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Community Rules</h3>
        <ol className="mt-4 space-y-4">
          {community.rules.map((rule, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                {i + 1}
              </span>
              <div>
                <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {rule}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}


function RoleBadge({ role }: { role: string }) {
  if (role === "moderator") {
    return (
      <span className="flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
        <Shield className="h-3 w-3" />
        Moderator
      </span>
    );
  }
  if (role === "admin") {
    return (
      <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-600 dark:bg-green-950 dark:text-green-300">
        <Shield className="h-3 w-3" />
        Admin
      </span>
    );
  }
  return (
    <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
      Member
    </span>
  );
}

export function MembersTab({members}:{members: CommunityMemeber[]}) {
  const [query, setQuery] = useState("");
  const filtered = members.filter((m) => (m.user.profile?.first_name && m.user.profile?.last_name) &&
    m.user.profile.first_name.toLowerCase().includes(query.toLowerCase())
  );
  const moderators = filtered.filter((m) => m.role === "moderator" || m.role === "admin");
  const visible = filtered.filter((m) => m.role === "member");

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search members..."
            className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-sm text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
          />
        </div>
      </div>

      {/* Moderators */}
      {moderators.length > 0 && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-2 dark:border-neutral-800 dark:bg-neutral-900">
            <p className="px-4 pt-3 text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
            Moderators · {moderators.length}
          </p>
          <div className="mt-1 divide-y divide-neutral-100 dark:divide-neutral-800">
            {moderators.map((m) => (
              <MemberRow key={m.id} member={m} />
            ))}
          </div>
        </div>
      )}

      {/* Members */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-2 dark:border-neutral-800 dark:bg-neutral-900">
      <p className="px-4 pt-3 text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
          Members · {visible.length}
        </p>
        <div className="mt-1 divide-y divide-neutral-100 dark:divide-neutral-800">
          {visible.length > 0 ? (
            visible.map((m) => <MemberRow key={m.id} member={m} />)
          ) : (
            <p className="px-4 py-6 text-center text-sm text-neutral-400 dark:text-neutral-500">
              No members match {query}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function MemberRow({ member }: { member: CommunityMemeber }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Avatar profile={member.user.profile}/>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          {member.user.profile.first_name + " " + member.user.profile.last_name}
        </div>
        <div className="truncate text-xs text-neutral-400 dark:text-neutral-500">
          <span className="w-10 truncate">{member.user.profile.university}</span> Joined {new Date(member.joined_at).toDateString().slice(3,)}
        </div>
      </div>
      <RoleBadge role={member.role} />
      <button className="shrink-0 rounded-lg p-1.5 text-neutral-300 hover:bg-neutral-50 hover:text-neutral-500 dark:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300">
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