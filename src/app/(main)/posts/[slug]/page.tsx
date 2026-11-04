"use client";

import { downvotePostForCurrentUser, getAccessToken, upvotePostForCurrentUser } from "@/app/actions/post-votes";
import { SideCard } from "@/components/shared/side-card";
import { Avatar, PollBlock } from "@/components/shared/ui";
import { AuthContext } from "@/context/auth-context";
import { getComments, getPost, joinLeaveCommunity, postComment, saveUnsave } from "@/libs/api";
import { plural } from "@/libs/format";
import { Community, NewComment, Post } from "@/libs/types";
import { ArrowBigDown, ArrowBigUp, ArrowLeft, Bookmark, Check, CheckCircle2, ChevronDown, Eye, MessageSquare, MoreHorizontal, Share2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Comment } from "@/libs/types";
import { CommentNode } from "@/components/main/comment/comment-node";
import { Composer } from "@/components/main/comment/comment-composer";
import { addReply } from "@/components/main/comment/comment-thread";
import ImageLightbox from "@/components/main/posts/image-light-box";


const RELATED = [
    { id: "r1", title: "Recursion vs iteration: when should I use which?", answers: 14 },
    { id: "r2", title: "Why does my fibonacci function take forever?", answers: 9 },
    { id: "r3", title: "How do I set the recursion limit in Python safely?", answers: 5 },
];

const SORT_OPTIONS: { id: SortId; label: string }[] = [
    { id: "best", label: "Best" },
    { id: "newest", label: "Newest" },
    { id: "oldest", label: "Oldest" },
];

function CommunityInfoCard({ post }: { post: Post | null }) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [community, setCommunity] = useState<Community | undefined>(post?.community)
    const [joined, setJoined] = useState(Boolean(community?.is_member));
    const { user } = useContext(AuthContext);
    
    if (!community) return;
    
    return (
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 uppercase items-center justify-center rounded-xl bg-indigo-500 text-sm font-bold text-white">
                    {community.name.slice(0, 2)}
                </div>
                <div className="min-w-0">
                    <div className="truncate font-semibold text-neutral-900 dark:text-neutral-100">
                        {community.name}
                    </div>
                    <div className="text-xs text-neutral-400 dark:text-neutral-500">
                        {community.member_count} students enrolled
                    </div>
                </div>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                {community.description}
            </p>

            <div className="mt-3 border-t border-neutral-100 pt-3 text-xs text-neutral-400 dark:border-neutral-800 dark:text-neutral-500">
                Created {community?.created_at && new Date(community.created_at).toDateString().slice(4,)}
            </div>

            <button
                type="button"
                disabled={ user.email === community.creator?.email}
                aria-pressed={joined}
                onClick={async () => { const res = community && await joinLeaveCommunity(joined, community.slug); setJoined(res.is_member); }}
                className={`mt-3 w-full rounded-lg py-2 text-sm font-semibold transition-colors ${joined
                    ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
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
    );
}

type SortId = "best" | "newest" | "oldest";

export default function PostDetailPage() {
    const router = useRouter();
    const { slug } = useParams<{ slug: string }>();
    const postId = Number(slug);
    const isInvalidId = Number.isNaN(postId);
    
    const [post, setPost] = useState<Post | null>(null);
    const [failed, setFailed] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [acceptedId, setAcceptedId] = useState<number | null>(1);
    const [sort, setSort] = useState<SortId>("best");
    const [sortOpen, setSortOpen] = useState(false);

    const [saved, setSaved] = useState(false);
    const [toast, setToast] = useState<string | null>(null);
    // Index of the image being viewed in the lightbox, or null when it's closed
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    
    useEffect(() => {
        if (isInvalidId) return;
        let cancelled = false;

        (async () => {
            try {
                const data = await getPost(postId, await getAccessToken());

                if (!cancelled) setPost(data);
                setSaved(data.is_saved)
            } catch (error) {
                console.error(error);
                if (!cancelled) setFailed(true);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [postId, isInvalidId]);

    useEffect(() => {
        getComments(Number(slug))
            .then((res) => {

                setComments(res.sort((a, b) => a.score - b.score));
            })
            .catch((error) => {
                console.error(error);
            });
    }, [slug]);

    const answersRef = useRef<HTMLDivElement>(null);
    const commentsVersion = useRef(0);
    const answerCount = comments.length;
    const replyCount = useMemo(
        () => comments.length,
        [comments]
    );

    const sorted = useMemo(() => {
        const copy = [...comments];
        if (sort === "best") copy.sort((a, b) => b.score - a.score);
        if (sort === "newest") copy.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        if (sort === "oldest") copy.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        // the accepted answer is always pinned to the top
        const idx = copy.findIndex((c) => c.id === acceptedId);
        if (idx > 0) copy.unshift(copy.splice(idx, 1)[0]);
        return copy;
    }, [comments, sort, acceptedId]);

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 2000);
        return () => clearTimeout(t);
    }, [toast]);

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
        } catch {
            /* clipboard can be blocked; still confirm */
        }
        setToast("Link copied");
    };


    let postContent;
    if (isInvalidId || failed) {
        postContent = (
            <p className="rounded-2xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
                We couldn&apos;t load this question. It may have been removed.
            </p>
        );
    } else if (!post) {
        postContent = (
            <div className="h-64 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
        );
    }

    const upVote = async () => {
        if (!post) return;
        const res = await upvotePostForCurrentUser(post.id);
        setPost(res);
    }

    const downVote = async () => {
        if (!post) return;
        const res = await downvotePostForCurrentUser(post.id);
        setPost(res);
    }
      const newComment = async (text: string, parent?: number): Promise<Comment> => {
        const newComment: NewComment = {
          post: Number(slug),
          content: text,
        }
        const access = await getAccessToken()
        const res = await postComment(parent ? { ...newComment, parent: parent } : { ...newComment }, access)
        return res
      };
    
      const handleAdd = async (text: string) => {
        const comment = await newComment(text)
        commentsVersion.current += 1;
        setComments((prev) => [comment, ...prev]);
      }
  const handleReply = async (parentId: number, text: string) => {
    const comment = await newComment(text, parentId)
    commentsVersion.current += 1;
    setComments((prev) => addReply(prev, parentId, comment));
  }

  const handleSave = () => {
    if (saved){
      saveUnsave(saved, Number(slug)).then(()=>setSaved(!saved)).catch(error=>console.log(error))
    }else{
      saveUnsave(saved, Number(slug)).then(()=>setSaved(!saved)).catch(error=>console.log(error))
    }
  }
    return (
        <div className="min-h-screen w-full bg-[#f4f6f9] dark:bg-neutral-950 pb-6">
            <div className="flex max-w-full gap-2 px-0 py-6">
                {/* Main column */}
                <main className="min-w-0 flex-1 space-y-4">
                    {/* Back + breadcrumb */}
                    <nav
                        aria-label="Breadcrumb"
                        className="flex items-center gap-3 text-sm"
                    >
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-semibold text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </button>
                        <span className="text-neutral-300 dark:text-neutral-600">/</span>
                        {post && (
                            <>
                                {/* Adjust to your community route */}
                                <Link
                                    href={`/communities/${post.community.slug}`}
                                    className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                                >
                                    {post.community.name}
                                </Link>
                                <span className="text-neutral-300 dark:text-neutral-600">/</span>
                            </>
                        )}
                        <span className="text-neutral-500 dark:text-neutral-400 capitalize">{post?.post_type}</span>
                    </nav>
                    {post ?
                        <article className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6 dark:border-neutral-800 dark:bg-neutral-900">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2.5">
                                    <Avatar profile={post?.author.profile} size="h-10 w-10" />
                                    <div className="text-sm">
                                        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                                            {post?.author.profile.last_name}
                                        </span>
                                        <span className="text-neutral-400 dark:text-neutral-500"> · {post?.community.name}</span>
                                        <div className="text-xs text-neutral-400 dark:text-neutral-500">
                                            Asked {post?.created_at}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                    <span
                                        className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold `}
                                    >
                                        {acceptedId !== null && <CheckCircle2 className="h-3.5 w-3.5" />}
                                        {"Accepted"}
                                    </span>
                                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                                        Question
                                    </span>
                                </div>
                            </div>

                            <h1 className="mt-4 text-2xl font-bold leading-snug text-neutral-900 dark:text-neutral-100">
                                {post?.title}
                            </h1>

                            <div className="mt-1.5 flex items-center gap-3 text-xs text-neutral-400 dark:text-neutral-500">
                                <span className="flex items-center gap-1">
                                    <Eye className="h-3.5 w-3.5" />
                                    Viewed {post?.comment_count} times
                                </span>
                            </div>

                            <div className="mt-4 space-y-4">
                                <p className="text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-300">
                                    {post.content}
                                </p>
                            </div>
                            {post.images && post.images.length > 0 && (
                                    post.images.length === 1 ? (
                                      // Single image: keep the natural aspect ratio, never crop. Click to open the viewer.
                                      <button
                                        type="button"
                                        onClick={() => setLightboxIndex(0)}
                                        aria-label="View image full screen"
                                        className="group relative mt-3 flex w-full cursor-zoom-in justify-center overflow-hidden rounded-xl bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 dark:bg-neutral-800"
                                      >
                                        <Image
                                          src={post.images[0]}
                                          alt={post.title}
                                          width={800}
                                          height={600}
                                          unoptimized
                                          className="h-auto max-h-[32rem] w-auto max-w-full object-contain"
                                        />
                                        <span className="pointer-events-none absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                                      </button>
                                    ) : (
                                      // Multiple images: uniform tiles, up to 4 shown, "+N" on the last one.
                                      // Each tile opens the viewer at that image.
                                      <div className="mt-3 grid grid-cols-2 gap-2 overflow-hidden rounded-xl">
                                        {post.images.slice(0, 4).map((src, i) => {
                                          const extra = post.images!.length - 4;
                                          const isLast = i === 3 && extra > 0;
                                          return (
                                            <button
                                              key={i}
                                              type="button"
                                              onClick={() => setLightboxIndex(i)}
                                              aria-label={isLast
                                                ? `View all ${post.images!.length} images`
                                                : `View image ${i + 1} of ${post.images!.length}`}
                                              className={`group relative block aspect-[4/3] cursor-zoom-in overflow-hidden bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-500 dark:bg-neutral-800 ${post.images!.length === 3 && i === 0 ? "col-span-2 aspect-[16/9]" : ""
                                                }`}
                                            >
                                              <Image
                                                src={src}
                                                alt=""
                                                fill
                                                unoptimized
                                                sizes="(max-width: 768px) 50vw, 400px"
                                                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                                              />
                                              <span className="pointer-events-none absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                                              {isLast && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-xl font-semibold text-white">
                                                  +{extra}
                                                </div>
                                              )}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    )
                                  )}
                            {post.post_type === "poll" && post.polls && <PollBlock options={post.polls} />}

                            <div className="mt-4 flex flex-wrap gap-2">
                                {post?.tags && post?.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="rounded-md bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {/* Action bar */}
                            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                                <div className="flex items-center gap-1 rounded-2xl bg-gray-100 dark:bg-neutral-800">
                                    <button
                                        onClick={upVote}
                                        className={`rounded-full p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 ${post.upvoted ? "text-indigo-600 dark:text-indigo-400" : ""
                                            }`}
                                        aria-label="Upvote"
                                    >
                                        <ArrowBigUp
                                            className={`h-5 w-5 ${post.upvoted ? "fill-indigo-600 dark:fill-indigo-400" : ""}`}
                                        />
                                    </button>
                                    <span
                                        className={`min-w-[1.5rem] text-center text-xs font-bold ${post.upvoted
                                            ? "text-indigo-600 dark:text-indigo-400"
                                            : post.downvoted
                                                ? "text-rose-500"
                                                : "text-neutral-600 dark:text-neutral-300"
                                            }`}
                                    >
                                        {post.score}
                                    </span>
                                    <button
                                        onClick={downVote}
                                        className={`rounded-full p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 ${post.downvoted ? "text-rose-500" : ""
                                            }`}
                                        aria-label="Downvote"
                                    >
                                        <ArrowBigDown
                                            className={`h-5 w-5 ${post.downvoted ? "fill-rose-500" : ""}`}
                                        />
                                    </button>
                                </div>

                                <div className="flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400">
                                    <button
                                        onClick={() =>
                                            answersRef.current?.scrollIntoView({
                                                behavior: "smooth",
                                                block: "start",
                                            })
                                        }
                                        className="flex items-center gap-1.5 rounded-full px-3 py-2 font-medium hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                                    >
                                        <MessageSquare className="h-4 w-4" />
                                        {plural(comments.filter(c => !c.parent).length || 0, "answer", "answers")}
                                    </button>
                                    <button
                                        onClick={copyLink}
                                        className="flex items-center gap-1.5 rounded-full px-3 py-2 font-medium hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                                    >
                                        <Share2 className="h-4 w-4" />
                                        Share
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleSave();
                                            setSaved((v) => !v);
                                            setToast(saved ? "Removed from saved" : "Post saved");
                                        }}
                                        className="flex items-center gap-1.5 rounded-full px-3 py-2 font-medium hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                                    >
                                        <Bookmark
                                            className={`h-4 w-4 ${saved ? "fill-indigo-600 text-indigo-600 dark:fill-indigo-400 dark:text-indigo-400" : ""
                                                }`}
                                        />
                                        {saved ? "Saved" : "Save"}
                                    </button>
                                    <button
                                        aria-label="More actions"
                                        className="rounded-full p-2 hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                                    >
                                        <MoreHorizontal className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </article>
                        : postContent
                    }
                    {/* Answers */}
                    <section
                        ref={answersRef}
                        className="scroll-mt-24 rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6 dark:border-neutral-800 dark:bg-neutral-900"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                                    {plural(answerCount, "Answer", "Answers")}
                                </h2>
                                {replyCount > 0 && (
                                    <p className="text-xs text-neutral-400 dark:text-neutral-500">
                                        {plural(replyCount, "reply", "replies")} in discussion
                                    </p>
                                )}
                            </div>

                            <div className="relative">
                                <button
                                    onClick={() => setSortOpen((v) => !v)}
                                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                >
                                    Sort by:{" "}
                                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                                        {SORT_OPTIONS.find((s) => s.id === sort)?.label}
                                    </span>
                                    <ChevronDown className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
                                </button>
                                {sortOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setSortOpen(false)}
                                        />
                                        <div className="absolute right-0 top-full z-20 mt-1 w-36 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
                                            {SORT_OPTIONS.map((s) => (
                                                <button
                                                    key={s.id}
                                                    onClick={() => {
                                                        setSort(s.id);
                                                        setSortOpen(false);
                                                    }}
                                                    className={`block w-full px-3.5 py-2 text-left text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 ${sort === s.id
                                                        ? "text-indigo-600 dark:text-indigo-400"
                                                        : "text-neutral-700 dark:text-neutral-200"
                                                        }`}
                                                >
                                                    {s.label}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Write an answer */}
                        <div className="mt-4">
                            <Composer
                                placeholder="Write your answer. Explain your reasoning so others can learn from it..."
                                submitLabel="Post answer" 
                                onSubmit={handleAdd} />
                        </div>

                        {/* Thread */}
                        <div className="mt-6 border-t border-neutral-100 pt-6 dark:border-neutral-800">
                            {sorted.length === 0 ? (
                                <p className="py-6 text-center text-sm text-neutral-400 dark:text-neutral-500">
                                    No answers yet. Be the first to help.
                                </p>
                            ) : (
                                sorted.map((c) => (
                                    <CommentNode
                                        key={c.id}
                                        comment={c}
                                        depth={0} 
                                        onReply={handleReply}
                                    />
                                ))
                            )}
                        </div>
                    </section>
                </main>

                {/* Right sidebar */}
                <aside className="w-0 xl:w-72 transition-all duration-300 shrink-0 self-start xl:sticky xl:top-16 xl:block">
                    <div className="hidden xl:block space-y-4">

                        {post && <CommunityInfoCard post={post} />}

                        <SideCard title="Community Rules">
                            <ol className="space-y-3">
                                {post?.community.rules.map((rule, i) => (
                                    <li
                                        key={rule}
                                        className="flex gap-2.5 text-sm text-neutral-600 dark:text-neutral-400"
                                    >
                                        <span className="font-semibold text-neutral-400 dark:text-neutral-500">
                                            {i + 1}.
                                        </span>
                                        {rule}
                                    </li>
                                ))}
                            </ol>
                        </SideCard>

                        <SideCard title="Related Questions">
                            {RELATED.map((q) => (
                                <div key={q.id}>
                                    <a
                                        href="#"
                                        className="text-sm font-semibold text-neutral-800 hover:text-indigo-600 dark:text-neutral-200 dark:hover:text-indigo-400"
                                    >
                                        {q.title}
                                    </a>
                                    <div className="text-xs text-neutral-400 dark:text-neutral-500">
                                        {plural(q.answers, "answer", "answers")}
                                    </div>
                                </div>
                            ))}
                        </SideCard>
                    </div>
                </aside>
            </div>
            {/* Full-screen image viewer */}
                  { post && lightboxIndex !== null && post.images && post.images.length > 0 && (
                    <ImageLightbox
                      images={post.images}
                      startIndex={lightboxIndex}
                      title={post.title}
                      onClose={() => setLightboxIndex(null)}
                    />
                  )}
            {toast && (
                <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
                    <Check className="h-4 w-4 text-emerald-400" strokeWidth={3} />
                    {toast}
                </div>
            )}
        </div>
    );
}