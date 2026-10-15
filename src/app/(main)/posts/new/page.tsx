"use client"

import { Chip } from "@/components/shared/ui";
import { BarChart3, Check, ChevronDown, HelpCircle, ImageIcon, Lightbulb, MessageSquare, Plus, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";


type PostType = "question" | "discussion" | "image" | "poll";
const POST_TYPES: PostType[] = ["question", "discussion", "image", "poll"];

const COMMUNITIES = [
  { id: "cs", name: "r/ComputerScience", color: "bg-indigo-500", mine: true },
  { id: "study", name: "r/StudyTips", color: "bg-emerald-500", mine: true },
  { id: "life", name: "r/CampusLife", color: "bg-amber-500", mine: true },
  { id: "math", name: "r/Mathematics", color: "bg-rose-500", mine: false },
  { id: "schol", name: "r/Scholarships", color: "bg-sky-500", mine: false },
];

const TYPE_META: Record<
  PostType,
  {
    label: string;
    description: string;
    chip: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  question: {
    label: "Question",
    description: "Get answers from your peers",
    chip: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300",
    icon: HelpCircle,
  },
  discussion: {
    label: "Discussion",
    description: "Start an open conversation",
    chip: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300",
    icon: MessageSquare,
  },
  image: {
    label: "Image",
    description: "Share photos with the community",
    chip: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300",
    icon: ImageIcon,
  },
  poll: {
    label: "Poll",
    description: "Let the community vote",
    chip: "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-300",
    icon: BarChart3,
  },
};


const TIPS: Record<PostType, string[]> = {
  question: [
    "Make the title a specific, answerable question",
    "Share what you've tried and any error messages",
    "Add tags so the right people find it",
  ],
  discussion: [
    "Open with a point of view or a clear prompt",
    "Keep it relevant to the community's topic",
    "Stay respectful when people disagree",
  ],
  image: [
    "Use clear, well-lit photos",
    "Add a caption so people have context",
    "Only post images you have the right to share",
  ],
  poll: [
    "Keep options short and distinct",
    "Offer 2 to 6 balanced choices",
    "Pick a duration that fits the topic",
  ],
};

const MAX_TITLE = 150;
const MAX_TAGS = 5;
const MAX_IMAGES = 4;
const MAX_POLL_OPTIONS = 6;

const POLL_DURATIONS = [
  { id: "1d", label: "1 day" },
  { id: "3d", label: "3 days" },
  { id: "7d", label: "7 days" },
];

function Switch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? "bg-indigo-600" : "bg-neutral-200 dark:bg-neutral-700"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full left-0.5 bg-white shadow transition-transform ${
          checked ? "translate-x-5" : ""
        }`}
      />
    </button>
  );
}

export default function CreatePostPage() {
  const [type, setType] = useState<PostType>("question");
  const [communityId, setCommunityId] = useState<string | null>(null);
  const [commOpen, setCommOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [images, setImages] = useState<{ id: string; url: string }[]>([]);
  const [dragging, setDragging] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [pollDuration, setPollDuration] = useState("3d");
  const [notify, setNotify] = useState(true);

  const community = COMMUNITIES.find((c) => c.id === communityId) ?? null;
  const filledOptions = pollOptions.filter((o) => o.trim());

  const missing: string[] = [];
  if (!community) missing.push("Choose a community");
  if (title.trim().length < 10) missing.push("Write a title (10+ characters)");
  if (type === "image" && images.length === 0) missing.push("Add at least one image");
  if (type === "poll" && filledOptions.length < 2) missing.push("Add at least two poll options");
  const canPost = missing.length === 0;

  /* ---- tags ---- */
  const addTag = () => {
    const t = tagInput.trim().replace(/^#/, "").replace(/\s+/g, "");
    if (!t || tags.includes(t) || tags.length >= MAX_TAGS) return;
    setTags((prev) => [...prev, t]);
    setTagInput("");
  };

  /* ---- images ---- */
  const addFiles = (files: FileList | File[] | null) => {
    if (!files) return;
    const room = MAX_IMAGES - images.length;
    const next = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, room)
      .map((f) => ({
        id: `${f.name}-${f.size}-${Math.random().toString(36).slice(2, 6)}`,
        url: URL.createObjectURL(f),
      }));
    setImages((prev) => [...prev, ...next]);
  };

  const removeImage = (id: string) =>
    setImages((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((i) => i.id !== id);
    });

  /* ---- poll ---- */
  const updateOption = (i: number, value: string) =>
    setPollOptions((prev) => prev.map((o, idx) => (idx === i ? value : o)));

  /* ---- submit ---- */
  const submit = () => {
    if (!canPost || !community) return;
    // onPublish({
    //   id: `new-${Date.now()}`,
    //   type,
    //   author: ME,
    //   school: ME_SCHOOL,
    //   community: community.name,
    //   ageHours: 0,
    //   postedAt: "just now",
    //   title: title.trim(),
    //   body: body.trim(),
    //   tags,
    //   upvotes: 1,
    //   answers: 0,
    //   images: type === "image" ? images.map((i) => i.url) : undefined,
    //   poll:
    //     type === "poll"
    //       ? filledOptions.map((label, i) => ({
    //           id: `o${i}`,
    //           label: label.trim(),
    //           votes: 0,
    //         }))
    //       : undefined,
    // });
  };

  const bodyLabel =
    type === "question"
      ? "Details"
      : type === "discussion"
      ? "Body"
      : type === "image"
      ? "Caption (optional)"
      : "Description (optional)";

  const bodyPlaceholder =
    type === "question"
      ? "Include what you've tried, error messages, or any context that helps..."
      : type === "discussion"
      ? "What do you want to talk about?"
      : type === "image"
      ? "Add some context for your photos..."
      : "Add any context for your poll...";

  const inputBase =
    "w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500";

  return (
    <div className="space-y-4 w-full">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Create a post</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Pick a post type, choose where it goes, and share it with the
          community.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
        {/* ---------------- Form ---------------- */}
        <div className="space-y-4">
          {/* Post type selection */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <label className="mb-3 block text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              Post type
            </label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {POST_TYPES.map((t) => {
                const meta = TYPE_META[t];
                const Icon = meta.icon;
                const active = type === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    aria-pressed={active}
                    className={`relative flex flex-col items-start gap-2 rounded-xl border p-3.5 text-left transition-colors ${
                      active
                        ? "border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40"
                        : "border-neutral-200 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                    }`}
                  >
                    {active && (
                      <span className="absolute right-2.5 top-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600">
                        <Check className="h-3 w-3 text-white" strokeWidth={3.5} />
                      </span>
                    )}
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                        active ? "bg-indigo-600 text-white" : meta.chip
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {meta.label}
                      </span>
                      <span className="block text-xs leading-snug text-neutral-500 dark:text-neutral-400">
                        {meta.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main fields */}
          <div className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            {/* Community */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                Community
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCommOpen((v) => !v)}
                  className="flex w-full items-center justify-between rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                >
                  {community ? (
                    <span className="flex items-center gap-2 font-medium text-neutral-800 dark:text-neutral-200">
                      <span className={`h-3 w-3 rounded ${community.color}`} />
                      {community.name}
                    </span>
                  ) : (
                    <span className="text-neutral-400 dark:text-neutral-500">Choose a community</span>
                  )}
                  <ChevronDown
                    className={`h-4 w-4 text-neutral-400 transition-transform dark:text-neutral-500 ${
                      commOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {commOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setCommOpen(false)}
                    />
                    <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
                      {COMMUNITIES.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setCommunityId(c.id);
                            setCommOpen(false);
                          }}
                          className="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800"
                        >
                          <span className="flex items-center gap-2">
                            <span className={`h-3 w-3 rounded ${c.color}`} />
                            {c.name}
                            {c.mine && (
                              <span className="text-xs font-normal text-neutral-400 dark:text-neutral-500">
                                joined
                              </span>
                            )}
                          </span>
                          {c.id === communityId && (
                            <Check
                              className="h-4 w-4 text-indigo-600"
                              strokeWidth={3}
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                  Title
                </label>
                <span className="text-xs text-neutral-400 dark:text-neutral-500">
                  {title.length}/{MAX_TITLE}
                </span>
              </div>
              <input
                type="text"
                value={title}
                maxLength={MAX_TITLE}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  type === "question"
                    ? "What do you want to know?"
                    : type === "poll"
                    ? "What's your poll question?"
                    : "Give your post a clear title"
                }
                className={inputBase}
              />
            </div>

            {/* Type specific: image upload */}
            {type === "image" && (
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                    Images
                  </label>
                  <span className="text-xs text-neutral-400 dark:text-neutral-500">
                    {images.length}/{MAX_IMAGES}
                  </span>
                </div>

                {images.length > 0 && (
                  <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {images.map((img) => (
                      <div
                        key={img.id}
                        className="group relative aspect-square overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700"
                      >
                        <Image
                          src={img.url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(img.id)}
                          aria-label="Remove image"
                          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900/70 text-white hover:bg-neutral-900"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {images.length < MAX_IMAGES && (
                  <label
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragging(false);
                      addFiles(e.dataTransfer.files);
                    }}
                    className={`flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed py-8 text-center transition-colors ${
                      dragging
                        ? "border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40"
                        : "border-neutral-300 bg-neutral-50/70 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800/70 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        addFiles(e.target.files);
                        e.target.value = "";
                      }}
                    />
                    <ImageIcon className="h-6 w-6 text-neutral-400 dark:text-neutral-500" />
                    <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                      Drag and drop, or click to upload
                    </span>
                    <span className="text-xs text-neutral-400 dark:text-neutral-500">
                      Up to {MAX_IMAGES} images
                    </span>
                  </label>
                )}
              </div>
            )}

            {/* Type specific: poll options */}
            {type === "poll" && (
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                  Poll options
                </label>
                <div className="space-y-2">
                  {pollOptions.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                        {i + 1}
                      </span>
                      <input
                        type="text"
                        value={opt}
                        maxLength={60}
                        onChange={(e) => updateOption(i, e.target.value)}
                        placeholder={`Option ${i + 1}`}
                        className={inputBase}
                      />
                      {pollOptions.length > 2 && (
                        <button
                          type="button"
                          aria-label="Remove option"
                          onClick={() =>
                            setPollOptions((prev) =>
                              prev.filter((_, idx) => idx !== i)
                            )
                          }
                          className="shrink-0 rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {pollOptions.length < MAX_POLL_OPTIONS && (
                  <button
                    type="button"
                    onClick={() => setPollOptions((prev) => [...prev, ""])}
                    className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:underline"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add option
                  </button>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                    Poll length
                  </span>
                  <div className="flex gap-2">
                    {POLL_DURATIONS.map((d) => (
                      <Chip
                        key={d.id}
                        active={pollDuration === d.id}
                        onClick={() => setPollDuration(d.id)}
                      >
                        {d.label}
                      </Chip>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Body */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                {bodyLabel}
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={bodyPlaceholder}
                rows={type === "question" || type === "discussion" ? 7 : 3}
                className={`${inputBase} resize-y`}
              />
            </div>

            {/* Tags */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                  Tags{" "}
                  <span className="font-normal text-neutral-400 dark:text-neutral-500">
                    (optional)
                  </span>
                </label>
                <span className="text-xs text-neutral-400 dark:text-neutral-500">
                  {tags.length}/{MAX_TAGS}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 dark:border-neutral-700">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="flex items-center gap-1 rounded-md bg-neutral-100 py-1 pl-2.5 pr-1.5 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                  >
                    {t}
                    <button
                      type="button"
                      aria-label={`Remove ${t}`}
                      onClick={() =>
                        setTags((prev) => prev.filter((x) => x !== t))
                      }
                      className="rounded p-0.5 text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {tags.length < MAX_TAGS && (
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        addTag();
                      }
                      if (e.key === "Backspace" && !tagInput && tags.length) {
                        setTags((prev) => prev.slice(0, -1));
                      }
                    }}
                    onBlur={addTag}
                    placeholder={
                      tags.length ? "Add another..." : "Type a tag and press Enter"
                    }
                    className="min-w-40 flex-1 bg-transparent py-1 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none dark:text-neutral-100 dark:placeholder:text-neutral-500"
                  />
                )}
              </div>
            </div>

            {/* Question only: notifications */}
            {type === "question" && (
              <div className="flex items-center justify-between gap-4 rounded-xl bg-neutral-50 px-4 py-3 dark:bg-neutral-800">
                <div>
                  <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                    Notify me about answers
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    Get a notification when someone answers this question
                  </div>
                </div>
                <Switch checked={notify} onChange={setNotify} />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              {canPost ? "Ready to post" : missing[0]}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                Save draft
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={!canPost}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400 dark:disabled:bg-neutral-700 dark:disabled:text-neutral-500"
              >
                Post
              </button>
            </div>
          </div>
        </div>

        {/* ---------------- Tips ---------------- */}
        <div className="space-y-4">
            <div className="sticky top-20 z-50 space-y-4">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Tips for a great {TYPE_META[type].label.toLowerCase()}
              </h3>
            </div>
            <ul className="mt-3 space-y-2.5">
              {TIPS[type].map((tip) => (
                <li
                  key={tip}
                  className="flex gap-2 text-sm leading-snug text-neutral-600 dark:text-neutral-300"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Before you post
            </h3>
            <ol className="mt-3 space-y-2.5">
              {[
                "Search first, your question may already be answered",
                "Don't share solutions to active coursework",
                "Be kind, classmates are here to help",
              ].map((rule, i) => (
                <li
                  key={rule}
                  className="flex gap-2.5 text-sm leading-snug text-neutral-600 dark:text-neutral-300"
                >
                  <span className="font-semibold text-neutral-400 dark:text-neutral-500">
                    {i + 1}.
                  </span>
                  {rule}
                </li>
              ))}
            </ol>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
