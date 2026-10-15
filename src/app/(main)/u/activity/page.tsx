"use client"
import React, { useContext, useEffect, useState } from "react";
import {
  Award,
  ShieldCheck,
  Zap,
} from "lucide-react";
import QuestionCard from "@/components/main/question-card";
import { getPosts } from "@/libs/api";
import { Post } from "@/libs/types";
import { AuthContext } from "@/context/auth-context";
import { Avatar } from "@/components/shared/ui";


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
  { id: "cs", name: "r/ComputerScience", members: "12.4k members", color: "bg-indigo-500" },
  { id: "study", name: "r/StudyTips", members: "8.9k members", color: "bg-emerald-500" },
  { id: "life", name: "r/CampusLife", members: "4.5k members", color: "bg-amber-500" },
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
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}


function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center text-sm text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-500">
      No {label} to show yet.
    </div>
  );
}

/* ----------------------------------------------------------------- */
/*  Page                                                             */
/* ----------------------------------------------------------------- */

export default function ProfilePage() {
  const [tab, setTab] = useState<TabId>("questions");
  const [posts, setPosts] = useState<Post[]>([]);
  const { user } = useContext(AuthContext);
  useEffect(()=>{
    getPosts(undefined, undefined, true)
        .then(res=>{setPosts(res)})
        .catch(error=>console.log(error));
  },[])
  

  return (
    <div className="min-h-screen w-full bg-[#f4f6f9] dark:bg-neutral-950">
      <div className="mx-auto flex gap-6 px-0 py-6">
        {/* Main */}
        <main className="min-w-0 flex-1 space-y-4">
          {/* Profile card */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center gap-5">
              <Avatar
                user={user}
                size="h-20 w-20"
                textSize="text-2xl"
              />
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {user?.first_name + " " + user?.last_name}
                </h1>
                <p className="mt-0.5 text-[15px] text-neutral-600 dark:text-neutral-300">
                  Adama Science and Technology University
                </p>
                <p className="mt-0.5 text-sm text-neutral-400 dark:text-neutral-500">
                  Joined {USER.joined}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
              {USER.bio}
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
            (posts.filter((p) => p.image).length > 0 ? (
              posts.filter((p) => p.image).map((p) => (
                <QuestionCard key={p.id} post={p} />
              ))
            ) : (
              <EmptyState label="saved posts" />
            ))}
          {tab === "answers" && <EmptyState label="answers" />}
          {tab === "activity" && <EmptyState label="recent activity" />}
        </main>

        {/* Right sidebar */}
        <aside className="hidden w-72 shrink-0 self-start space-y-4 xl:sticky xl:top-16 xl:block">
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
        </aside>
      </div>
    </div>
  );
}
