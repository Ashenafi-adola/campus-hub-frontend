"use client"

import React, { useContext, useEffect, useState } from "react";
import {
  Check,
  Plus,
} from "lucide-react";
import Image from "next/image"
import { useParams } from "next/navigation";
import { Community, CommunityMemeber, Post } from "@/libs/types";
import { getCommunity, joinLeaveCommunity } from "@/libs/api";
import { AboutTab, MembersTab, PostsTab } from "@/components/main/community/community-tabs";
import { AuthContext } from "@/context/auth-context";
import CreatePostModal from "@/components/main/posts/post-modal";

type TabId = "posts" | "questions" | "about" | "members";


const TABS: { id: TabId; label: string }[] = [
  { id: "posts", label: "Posts" },
  { id: "questions", label: "Questions" },
  { id: "about", label: "About" },
  { id: "members", label: "Members" },
];


function SideCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">{title}</h3>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}


export default function CommunityDetailPage() {
  const [show, setShow] = useState<boolean>(false);
  const [tab, setTab] = useState<TabId>("posts");
  const params = useParams();
  const slug = String(params.slug);
  const [joined, setJoined] = useState<boolean | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [community, setCommunity] = useState<Community | null>(null);
  const [members, setMembers] = useState<CommunityMemeber[]>([])
  const { user } = useContext(AuthContext)
  useEffect(() => {
    const controller = new AbortController();

    getCommunity(slug, controller.signal)
      .then(res=>{setCommunity(res.community); setPosts(res.posts); setJoined(Boolean(res.community.is_member)); setMembers(res.members);})
      .catch((error: unknown) => {
        if (!controller.signal.aborted) console.error(error);
      });

    return () => controller.abort();
  }, [slug]);
  if (!community) return null;

  return (
    <div className="relative min-h-screen w-full min-w-0 bg-[#f4f6f9] dark:bg-neutral-950">
      <CreatePostModal show={show} setShow={() => setShow(false)}/>
 
      <div className="mx-auto flex max-w-full gap-2 md:px-1 py-6">
        {/* Main content */}
        <main className="flex-1 space-y-5 min-w-0">
          {/* Banner + header */}
          <div className="overflow-hidden max-w-full relative rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            {community.banner ? (
              <div className="relative h-25 w-full">
                <Image
                  fill
                  src={typeof(community.banner) === "object" ? community.banner.name : community.banner}
                  alt={community.name}
                  unoptimized
                  className="object-cover"
                />
              </div>
            ) : (
              <div
                className="relative h-30 w-full bg-neutral-900"
                style={{
                  backgroundImage:
                    "linear-gradient(120deg, rgba(79,70,229,0.5), rgba(236,72,153,0.4)), repeating-linear-gradient(45deg, rgba(255,255,255,0.06) 0 2px, transparent 2px 40px)",
                  backgroundColor: community.color,
                  }}
              />
            )}

            <div className="px-6 pb-5">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex items-end gap-4">
                  <div className="relative -mt-12 h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-white shadow-lg shadow-neutral-400/40 dark:border-neutral-900"
                      style={{
                        backgroundColor: community.color
                      }}
                  >
                    {community?.icon ? (
                      <Image
                        fill
                        src={typeof(community.icon) === "object" ? community.icon.name :community.icon}
                        alt={community.name}
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-5xl font-bold text-white">
                          {community.name.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pb-1">
                    <h1 className="text-2xl truncate sm:w-70 md:w-full font-bold text-neutral-900 dark:text-neutral-100">
                      c/{community?.name.replaceAll(" ", "")}
                    </h1>
                    <p className="text-sm text-neutral-400 dark:text-neutral-500">
                      {community?.member_count} students enrolled
                    </p>
                  </div>
                </div>

                <div
                  className="mt-4 flex items-center gap-2 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                  <button
                    disabled={ user?.email === community.creator?.email }
                    onClick={async () => { const res = await joinLeaveCommunity(Boolean(joined), community.slug); setJoined(res.is_member); }}
                    className={`flex-1 ${ user?.email === community.creator?.email && "cursor-not-allowed"} rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${joined
                      ? "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-700 dark:hover:bg-neutral-600"
                      : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 dark:hover:bg-indigo-900"
                      }`}
                  >
                    {joined ? (
                      <span className="flex items-center justify-center gap-1.5">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        Joined
                      </span>
                    ) : (
                      "Join Community"
                    )}
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="mt-5 flex gap-6 border-b border-neutral-100 dark:border-neutral-800">
                {TABS.map((t) => {
                  const active = tab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className={`pb-3 text-sm font-semibold transition-colors ${active
                          ? "border-b-2 border-indigo-600 text-indigo-600"
                          : "border-b-2 border-transparent text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100"
                        }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Posts */}
          {tab === "posts" && <PostsTab posts={posts}/>
          }
          {
            tab === "about" && <AboutTab community={community} posts={posts} members={members}/>
          }

          {tab === "questions" && (
            <PostsTab posts={posts.filter((p)=>p.post_type === "question")}/>
          )}

          {
            tab === "members" && <MembersTab members={members}/>
          }
        </main>

        {/* Right sidebar */}
        <aside className="w-0 xl:w-72 transition-all duration-300 shrink-0 self-start xl:sticky xl:top-16 xl:block">
          <div className="hidden xl:block space-y-4">
            <SideCard title="About Community">
              <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                {community.description}
              </p>
              <div className="border-t border-neutral-100 pt-3 dark:border-neutral-800">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  Created
                </p>
                <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">{ community.created_at && new Date(community.created_at).toDateString().slice(3,)}</p>
              </div>
            </SideCard>

            <SideCard title="Community Rules">
              <ol className="space-y-3">
                {community.rules.map((rule, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-neutral-600 dark:text-neutral-300">
                    <span className="font-semibold text-neutral-400 dark:text-neutral-500">
                      {i + 1}.
                    </span>
                    {rule}
                  </li>
                ))}
              </ol>
            </SideCard>
          </div>
        </aside>
      </div>
      <div className="group fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] sm:right-6 sm:bottom-6 z-101">
        <span className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-neutral-900 px-2.5 py-1 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          {show ? "Close form" : "Create post"}
        </span>
        <button
          onClick={()=>setShow(prev=>!prev)}
          aria-label="Create post"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-700 text-white shadow-lg hover:bg-blue-600 sm:h-14 sm:w-14"
        >
          <Plus className={`h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-300 ${ show && "rotate-135"}`} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
