"use client"

import React, { useEffect, useState } from "react";
import {
  Check,
} from "lucide-react";
import Image from "next/image"
import QuestionCard from "@/components/main/question-card";
import { usePosts } from "@/hooks/use-posts";
import { useParams } from "next/navigation";
import { Community } from "@/libs/types";
import { getCommunity } from "@/libs/api";
import { PostFeedSkeleton } from "@/components/main/laoding-skeletons";
import { AboutTab, MembersTab, PostsTab } from "@/components/main/community/community-tabs";

type TabId = "posts" | "questions" | "about" | "members";


const TABS: { id: TabId; label: string }[] = [
  { id: "posts", label: "Posts" },
  { id: "questions", label: "Questions" },
  { id: "about", label: "About" },
  { id: "members", label: "Members" },
];

const RULES = [
  "No direct answer sharing for active coursework",
  "Keep discussions academic and respectful",
  "Format code blocks properly",
];

function SideCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <h3 className="font-semibold text-neutral-900">{title}</h3>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}


export default function CommunityDetailPage() {
  const [tab, setTab] = useState<TabId>("posts");
  const params = useParams();
  const slug = String(params.slug);
  const [joined, setJoined] = useState(true);
  const { posts } = usePosts()
  const [community, setCommunity] = useState<Community | null>(null);
  useEffect(() => {
    const controller = new AbortController();

    getCommunity(slug, controller.signal)
      .then(setCommunity)
      .catch((error: unknown) => {
        if (!controller.signal.aborted) console.error(error);
      });

    return () => controller.abort();
  }, [slug]);
  if (!community) return null;

  return (
    <div className="min-h-screen bg-[#f4f6f9] w-full">
      <div className="mx-auto flex max-w-full gap-6 px-1 py-6">
        {/* Main content */}
        <main className="min-w- flex-1 space-y-5">
          {/* Banner + header */}
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
            {community.banner ? (
              <div className="relative h-44 w-full">
                <Image
                  fill
                  src={community.banner}
                  alt={community.name}
                  unoptimized
                  className="object-cover"
                />
              </div>
            ) : (
              <div
                className="relative h-44 bg-neutral-900"
                style={{
                  backgroundImage:
                    "linear-gradient(120deg, rgba(79,70,229,0.5), rgba(236,72,153,0.4)), repeating-linear-gradient(45deg, rgba(255,255,255,0.06) 0 2px, transparent 2px 40px)",
                }}
              />
            )}

            <div className="px-6 pb-5">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex items-end gap-4">
                  <div className="relative -mt-12 h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-white bg-indigo-600 shadow-lg shadow-neutral-400/40">
                    {community?.icon ? (
                      <Image
                        fill
                        src={community.icon}
                        alt={community.name}
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-2xl font-bold text-white">
                          {community.name.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pb-1">
                    <h1 className="text-2xl font-bold text-neutral-900">
                      c/{community?.name.replaceAll(" ", "")}
                    </h1>
                    <p className="text-sm text-neutral-400">
                      {community?.member_count} students enrolled
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setJoined((v) => !v)}
                  className={`mb-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${joined
                      ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                >
                  {joined ? (
                    <span className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      Joined
                    </span>
                  ) : (
                    "Join Community"
                  )}
                </button>
              </div>

              {/* Tabs */}
              <div className="mt-5 flex gap-6 border-b border-neutral-100">
                {TABS.map((t) => {
                  const active = tab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className={`pb-3 text-sm font-semibold transition-colors ${active
                          ? "border-b-2 border-indigo-600 text-indigo-600"
                          : "border-b-2 border-transparent text-neutral-500 hover:text-neutral-800"
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
            tab === "about" && <AboutTab/>
          }

          {tab === "questions" && (
            <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-400">
              {TABS.find((t) => t.id === tab)?.label} content goes here.
            </div>
          )}

          {
            tab === "members" && <MembersTab/>
          }
        </main>

        {/* Right sidebar */}
        <aside className="hidden w-72 shrink-0 self-start space-y-4 xl:sticky xl:top-16 xl:block">
          <SideCard title="About Community">
            <p className="text-sm leading-relaxed text-neutral-600">
              {community.description}
            </p>
            <div className="border-t border-neutral-100 pt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Created
              </p>
              <p className="mt-1 text-sm text-neutral-700">{new Date(community.created_at).toDateString().slice(3,)}</p>
            </div>
          </SideCard>

          <SideCard title="Community Rules">
            <ol className="space-y-3">
              {RULES.map((rule, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-neutral-600">
                  <span className="font-semibold text-neutral-400">
                    {i + 1}.
                  </span>
                  {rule}
                </li>
              ))}
            </ol>
          </SideCard>
        </aside>
      </div>
    </div>
  );
}
