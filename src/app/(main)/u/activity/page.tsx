"use client"
import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  Award,
  CircleQuestionMark,
  Clock,
  File,
  ShieldCheck,
  Zap,
} from "lucide-react";
import QuestionCard from "@/components/main/post-card";
import { getPosts, getSavedPosts } from "@/libs/api";
import { Post, SavedPost } from "@/libs/types";
import { AuthContext } from "@/context/auth-context";
import { Avatar, EmptyState } from "@/components/shared/ui";
import { SideCard } from "@/components/shared/side-card";


type TabId = "questions" | "answers" | "saved" | "activity";

const USER = {
  name: "Alex Johnson",
  school: "Stanford University",
  joined: "September 2024",
  bio: "CS junior passionate about algorithms and open source. Always happy to help with study advice or graph theory puzzles!",
};

const STATS = [
  { label: "Questions Asked", value: "24" },
  { label: "Answers Given", value: "87" },
  { label: "Helpful Answers", value: "42" },
  { label: "Reputation", value: "1,250" },
];


const MY_COMMUNITIES = [
  { id: "cs", name: "c/ComputerScience", members: "12.4k members", color: "bg-indigo-500" },
  { id: "study", name: "c/StudyTips", members: "8.9k members", color: "bg-emerald-500" },
  { id: "life", name: "c/CampusLife", members: "4.5k members", color: "bg-amber-500" },
];

const BADGES = [
  {
    id: "first",
    title: "First Answer",
    description: "Helped a peer for the first time",
    icon: Award,
    bg: "bg-indigo-50 dark:bg-indigo-950",
    color: "text-indigo-600",
  },
  {
    id: "hero",
    title: "Helpful Hero",
    description: "40+ verified helpful answers",
    icon: ShieldCheck,
    bg: "bg-emerald-50 dark:bg-emerald-950",
    color: "text-emerald-600",
  },
  {
    id: "upvotes",
    title: "100 Upvotes",
    description: "Earned 100+ likes on a single post",
    icon: Zap,
    bg: "bg-orange-50 dark:bg-orange-950",
    color: "text-orange-500",
  },
];

const TABS: { id: TabId; label: string }[] = [
  { id: "questions", label: "Questions" },
  { id: "answers", label: "Answers" },
  { id: "saved", label: "Saved" },
  { id: "activity", label: "Activity" },
];



/* ----------------------------------------------------------------- */
/*  Page                                                             */
/* ----------------------------------------------------------------- */

export default function ProfilePage() {
  const [tab, setTab] = useState<TabId>("questions");
  const [posts, setPosts] = useState<Post[]>([]);
  const [saveds, setSaveds] = useState<SavedPost[]>([])
  const { user } = useContext(AuthContext);

  const profile = useMemo(()=>{
    return user.profile
  },[user.profile])

  useEffect(()=>{
    getPosts(undefined, undefined, true)
        .then(res=>{setPosts(res); })
        .catch(error=>console.log(error));
    getSavedPosts().then(res=>setSaveds(res)).catch(error=>console.log(error))
  },[])
  


  return (
    <div className="min-h-screen w-full bg-[#f4f6f9] dark:bg-neutral-950">
      <div className="mx-auto flex gap-2 px-0 py-6">
        {/* Main */}
        <main className="min-w-0 flex-1 space-y-4">
          {/* Profile card */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center gap-5">
              {profile && <Avatar
                profile={profile}
                size="h-20 w-20"
                textSize="text-2xl"
              />}
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {profile?.first_name + " " + profile?.last_name}
                </h1>
                <p className="mt-0.5 text-[15px] text-neutral-600 dark:text-neutral-300">
                  {profile?.university}
                </p>
                <p className="mt-0.5 text-sm text-neutral-400 dark:text-neutral-500">
                  Joined {USER.joined}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
              {profile?.bio}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-neutral-100 pt-5 sm:grid-cols-4 dark:border-neutral-800">
              {STATS.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                    {s.value}
                  </div>
                  <div className="mt-0.5 text-xs text-neutral-400 dark:text-neutral-500">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 px-2">
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`border-b-2 pb-2.5 text-sm font-semibold transition-colors ${
                    active
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          {tab === "questions" &&
            posts.map((p) => <QuestionCard key={p.id} post={p} />)}
          {tab === "saved" &&
            (saveds.length > 0 ? (
              saveds.map((p) => (
                <QuestionCard key={p.id} post={p.post} />
              ))
            ) : (
              <EmptyState title="saved posts" icon={CircleQuestionMark} text={""} />
            ))}
          {tab === "answers" && <EmptyState title="no answers" icon={File} text={"text"} />}
          {tab === "activity" && <EmptyState title="recent activity" icon={Clock} text={""} />}
        </main>

        {/* Right sidebar */}
        <aside className="w-0 xl:w-72 transition-all duration-300 shrink-0 self-start xl:sticky xl:top-16 xl:block">
          <div className="hidden xl:block space-y-4">
            <SideCard title="Badges & Achievements">
              {BADGES.map(({ id, title, description, icon: Icon, bg, color }) => (
                <div key={id} className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${bg}`}
                  >
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {title}
                    </div>
                    <div className="text-xs text-neutral-400 dark:text-neutral-500">{description}</div>
                  </div>
                </div>
              ))}
            </SideCard>

            <SideCard title="My Communities">
              {MY_COMMUNITIES.map((c) => (
                <a key={c.id} href="#" className="flex items-center gap-3">
                  <span className={`h-6 w-6 shrink-0 rounded-md ${c.color}`} />
                  <div>
                    <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {c.name}
                    </div>
                    <div className="text-xs text-neutral-400 dark:text-neutral-500">{c.members}</div>
                  </div>
                </a>
              ))}
            </SideCard>
          </div>
        </aside>
      </div>
    </div>
  );
}
