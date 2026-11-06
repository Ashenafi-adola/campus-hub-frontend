"use client";

import {
  useContext,
  useEffect,
  useState,
  type ContextType,
} from "react";
import Link from "next/link";
import {
  Award,
  CircleQuestionMark,
  Clock,
  File as FileIcon,
  ShieldCheck,
  Zap,
} from "lucide-react";

import QuestionCard from "@/components/main/posts/post-card";
import { Avatar, EmptyState } from "@/components/shared/ui";
import { SideCard } from "@/components/shared/side-card";
import { AuthContext } from "@/context/auth-context";
// NOTE: `getUserProfile` and `getUserPosts` are assumed — see the notes in the reply.
import { getPosts, getSavedPosts, getUserPosts, getUserProfile } from "@/libs/api";
import type { Post, SavedPost } from "@/libs/types";
import { useParams } from "next/navigation";

type Profile = NonNullable<ContextType<typeof AuthContext>["user"]["profile"]>;
type TabId = "questions" | "answers" | "saved" | "activity";

/* ----------------------------------------------------------------- */
/*  Static data (still mocked)                                       */
/* ----------------------------------------------------------------- */

// TODO: replace with the real route for editing the signed-in user's profile.
const EDIT_PROFILE_HREF = "/settings/profile";

const JOINED = "September 2024";

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

/** `ownerOnly` tabs hold private content and are hidden from visitors. */
const TABS: { id: TabId; label: string; ownerOnly?: boolean }[] = [
  { id: "questions", label: "Questions" },
  { id: "answers", label: "Answers" },
  { id: "saved", label: "Saved", ownerOnly: true },
  { id: "activity", label: "Activity", ownerOnly: true },
];

/* ----------------------------------------------------------------- */
/*  Page                                                             */
/* ----------------------------------------------------------------- */



export default function ProfilePage() {
  const { user } = useContext(AuthContext);
  const viewerProfile = user.profile;
  const { username } = useParams();
  // Viewing your own profile, either by omitting `userId` or by visiting your own id.
  const isOwner =
    username === "me" ||
    (viewerProfile != null && String(viewerProfile.id) === String(username));
  const targetId = isOwner ? undefined : String(username);

  const [tab, setTab] = useState<TabId>("questions");
  const [posts, setPosts] = useState<Post[]>([]);
  const [saveds, setSaveds] = useState<SavedPost[]>([]);
  const [otherProfile, setOtherProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const profile: Profile | null = isOwner ? (viewerProfile ?? null) : otherProfile;

  useEffect(() => {
    let cancelled = false;
    
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    setPosts([]);
    setSaveds([]);
    setOtherProfile(null);

    (async () => {
      try {
        if (targetId === undefined) {
          const [postsRes, savedRes] = await Promise.all([
            getPosts(undefined, undefined, true),
            getSavedPosts(),
          ]);
          if (cancelled) return;
          setPosts(postsRes);
          setSaveds(savedRes);
        } else {
          const [profileRes, postsRes] = await Promise.all([
            getUserProfile(targetId),
            getUserPosts(targetId),
          ]);
          if (cancelled) return;
          setOtherProfile(profileRes);
          setPosts(postsRes);
        }
      } catch (err) {
        if (cancelled) return;
        console.error(err);
        setError("We couldn't load this profile. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [targetId]);

  /* ---- derived ---- */
  const visibleTabs = TABS.filter((t) => isOwner || !t.ownerOnly);
  // If the user was on a private tab and the profile changes, fall back safely.
  const activeTab = visibleTabs.some((t) => t.id === tab) ? tab : "questions";

  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ");
  const firstName = profile?.first_name || "This user";

  const stats = [
    { label: "Questions Asked", value: loading ? "–" : posts.length },
    { label: "Answers Given", value: "87" },
    { label: "Helpful Answers", value: "42" },
    { label: "Reputation", value: "1,250" },
  ];

  const noProfile = !loading && !profile;

  return (
    <div className="min-h-screen w-full bg-[#f4f6f9] dark:bg-neutral-950">
      <div className="mx-auto flex gap-2 px-0 py-6">
        {/* Main */}
        <main className="min-w-0 flex-1 space-y-4">
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
            >
              {error}
            </div>
          )}

          {noProfile && !error ? (
            <EmptyState
              title="Profile not found"
              icon={CircleQuestionMark}
              text="This profile doesn't exist or is no longer available."
            />
          ) : (
            <>
              {/* Profile card */}
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex items-center gap-5">
                  {profile && (
                    <Avatar profile={profile} size="h-20 w-20" textSize="text-2xl" />
                  )}
                  <div className="min-w-0 flex-1">
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                      {fullName}
                    </h1>
                    <p className="mt-0.5 text-[15px] text-neutral-600 dark:text-neutral-300">
                      {profile?.university}
                    </p>
                    <p className="mt-0.5 text-sm text-neutral-400 dark:text-neutral-500">
                      Joined {JOINED}
                    </p>
                  </div>

                  {isOwner && (
                    <Link
                      href={EDIT_PROFILE_HREF}
                      className="shrink-0 self-start rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
                    >
                      Edit profile
                    </Link>
                  )}
                </div>

                {profile?.bio && (
                  <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                    {profile.bio}
                  </p>
                )}

                <div className="mt-5 grid grid-cols-2 gap-4 border-t border-neutral-100 pt-5 sm:grid-cols-4 dark:border-neutral-800">
                  {stats.map((s) => (
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
              <div className="flex gap-6 px-2" role="tablist">
                {visibleTabs.map((t) => {
                  const active = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
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
              {activeTab === "questions" &&
                (posts.length > 0 ? (
                  posts.map((p) => <QuestionCard key={p.id} post={p} />)
                ) : (
                  !loading && (
                    <EmptyState
                      title={isOwner ? "No questions yet" : `${firstName} hasn't asked anything yet`}
                      icon={CircleQuestionMark}
                      text={
                        isOwner
                          ? "Questions you ask will show up here."
                          : "Questions they ask will show up here."
                      }
                    />
                  )
                ))}

              {activeTab === "answers" && (
                <EmptyState
                  title={isOwner ? "No answers yet" : `${firstName} hasn't answered anything yet`}
                  icon={FileIcon}
                  text={
                    isOwner
                      ? "Answers you give will show up here."
                      : "Answers they give will show up here."
                  }
                />
              )}

              {isOwner && activeTab === "saved" &&
                (saveds.length > 0 ? (
                  saveds.map((s) => <QuestionCard key={s.id} post={s.post} />)
                ) : (
                  !loading && (
                    <EmptyState
                      title="No saved posts"
                      icon={CircleQuestionMark}
                      text="Posts you save will show up here."
                    />
                  )
                ))}

              {isOwner && activeTab === "activity" && (
                <EmptyState
                  title="No recent activity"
                  icon={Clock}
                  text="Your recent activity will show up here."
                />
              )}
            </>
          )}
        </main>

        {/* Right sidebar */}
        <aside className="w-0 shrink-0 self-start transition-all duration-300 xl:sticky xl:top-16 xl:block xl:w-72">
          <div className="hidden space-y-4 xl:block">
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
                    <div className="text-xs text-neutral-400 dark:text-neutral-500">
                      {description}
                    </div>
                  </div>
                </div>
              ))}
            </SideCard>

            {/* TODO: show other users' communities once there's an endpoint for them. */}
            {isOwner && (
              <SideCard title="My Communities">
                {MY_COMMUNITIES.map((c) => (
                  <a key={c.id} href="#" className="flex items-center gap-3">
                    <span className={`h-6 w-6 shrink-0 rounded-md ${c.color}`} />
                    <div>
                      <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {c.name}
                      </div>
                      <div className="text-xs text-neutral-400 dark:text-neutral-500">
                        {c.members}
                      </div>
                    </div>
                  </a>
                ))}
              </SideCard>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}