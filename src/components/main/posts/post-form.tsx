import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import Image from "next/image";
import {
  BarChart3,
  Check,
  ChevronDown,
  HelpCircle,
  ImageIcon,
  MessageSquare,
  Plus,
  X,
} from "lucide-react";

import { getAccessToken } from "@/app/actions/post-votes";
import { Chip } from "@/components/shared/ui";
import { useCommunities } from "@/hooks/use-communities";
import { createPost, getPost, updatePost } from "@/libs/api";
import { Post, type NewPost, type PostType } from "@/libs/types";
import PostStatusModal, { PostingState } from "./post-status-modal";
import { redirect } from "next/navigation";

/* -------------------------------------------------------------------------- */
/*  Constants                                                                 */
/* -------------------------------------------------------------------------- */

const MAX_TITLE = 150;
const MIN_TITLE = 10;
const MAX_TAGS = 5;
const MAX_IMAGES = 4;
const MAX_POLL_OPTIONS = 6;
const MIN_POLL_OPTIONS = 2;
const MAX_POLL_OPTION_LENGTH = 60;

const POLL_DURATIONS = [
  { id: 1, label: "1 day" },
  { id: 3, label: "3 days" },
  { id: 7, label: "7 days" },
] as const;

const POST_TYPES: PostType[] = ["question", "discussion", "image", "poll"];

const TYPE_META: Record<
  PostType,
  {
    label: string;
    description: string;
    chip: string;
    icon: ComponentType<{ className?: string }>;
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

const COPY: Record<
  PostType,
  {
    titlePlaceholder: string;
    bodyLabel: string;
    bodyPlaceholder: string;
    bodyRows: number;
  }
> = {
  question: {
    titlePlaceholder: "What do you want to know?",
    bodyLabel: "Details",
    bodyPlaceholder:
      "Include what you've tried, error messages, or any context that helps...",
    bodyRows: 7,
  },
  discussion: {
    titlePlaceholder: "Give your post a clear title",
    bodyLabel: "Body",
    bodyPlaceholder: "What do you want to talk about?",
    bodyRows: 7,
  },
  image: {
    titlePlaceholder: "Give your post a clear title",
    bodyLabel: "Caption (optional)",
    bodyPlaceholder: "Add some context for your photos...",
    bodyRows: 3,
  },
  poll: {
    titlePlaceholder: "What's your poll question?",
    bodyLabel: "Description (optional)",
    bodyPlaceholder: "Add any context for your poll...",
    bodyRows: 3,
  },
};

/* Shared class names */
const CARD =
  "rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900";
const LABEL = "text-sm font-semibold text-neutral-800 dark:text-neutral-200";
const HINT = "text-xs text-neutral-400 dark:text-neutral-500";
const INPUT =
  "w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500";

type Community = ReturnType<typeof useCommunities>["communities"][number];

/**
 * An image in the form: either one already saved on the post (shown straight
 * from its URL) or a file the user just picked (shown via an object URL).
 */
type ImageItem =
  | { kind: "existing"; id: string; url: string }
  | { kind: "new"; id: string; file: File };

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

let imageIdCounter = 0;
const nextImageId = () => `image-${imageIdCounter++}`;

/** Downloads an existing image so it can be re-submitted with an edited post. */
async function urlToFile(url: string, index: number): Promise<File> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load image: ${url}`);

  const blob = await response.blob();
  const name =
    new URL(url, window.location.href).pathname.split("/").pop() ||
    `image-${index + 1}`;
  return new File([blob], name, { type: blob.type });
}

/** Pads a loaded option list so the poll editor always shows the minimum rows. */
function withMinimumOptions(options: string[]): string[] {
  const padded = [...options];
  while (padded.length < MIN_POLL_OPTIONS) padded.push("");
  return padded;
}

/* -------------------------------------------------------------------------- */
/*  Small building blocks                                                     */
/* -------------------------------------------------------------------------- */

function Field({
  label,
  htmlFor,
  optional,
  counter,
  children,
}: {
  label: string;
  htmlFor?: string;
  optional?: boolean;
  counter?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={htmlFor} className={LABEL}>
          {label}
          {optional && (
            <span className="ml-1 font-normal text-neutral-400 dark:text-neutral-500">
              (optional)
            </span>
          )}
        </label>
        {counter && <span className={HINT}>{counter}</span>}
      </div>
      {children}
    </div>
  );
}

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? "bg-indigo-600" : "bg-neutral-200 dark:bg-neutral-700"
      }`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : ""
        }`}
      />
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  Post type selector                                                        */
/* -------------------------------------------------------------------------- */

function PostTypeSelector({
  value,
  onChange,
  disabled = false,
}: {
  value: PostType;
  onChange: (type: PostType) => void;
  /** The type can't change once a post exists. */
  disabled?: boolean;
}) {
  const labelId = useId();

  return (
    <div className={CARD}>
      <span className={`${LABEL} mb-3 block`} id={labelId}>
        Post type
      </span>
      <div
        role="group"
        aria-labelledby={labelId}
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        {POST_TYPES.map((t) => {
          const { label, description, chip, icon: Icon } = TYPE_META[t];
          const active = value === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => onChange(t)}
              aria-pressed={active}
              disabled={disabled}
              className={`relative flex flex-col items-start gap-2 rounded-xl border p-3.5 text-left transition-colors disabled:cursor-not-allowed ${
                active
                  ? "border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40"
                  : "border-neutral-200 hover:bg-neutral-50 disabled:opacity-50 disabled:hover:bg-transparent dark:border-neutral-700 dark:hover:bg-neutral-800"
              }`}
            >
              {active && (
                <span className="absolute right-2.5 top-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600">
                  <Check className="h-3 w-3 text-white" strokeWidth={3.5} />
                </span>
              )}
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                  active ? "bg-indigo-600 text-white" : chip
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {label}
                </span>
                <span className="block text-xs leading-snug text-neutral-500 dark:text-neutral-400">
                  {description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Community picker                                                          */
/* -------------------------------------------------------------------------- */

function CommunityPicker({
  communities,
  selected,
  onSelect,
}: {
  communities: Community[];
  selected: Community | null;
  onSelect: (slug: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const labelId = useId();
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div>
      <span id={labelId} className={`${LABEL} mb-1.5 block`}>
        Community
      </span>
      <div className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-labelledby={labelId}
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
        >
          {selected ? (
            <span className="flex items-center gap-2 font-medium text-neutral-800 dark:text-neutral-200">
              <span className={`h-3 w-3 rounded ${selected.color}`} />
              {selected.name}
            </span>
          ) : (
            <span className="text-neutral-400 dark:text-neutral-500">
              Choose a community
            </span>
          )}
          <ChevronDown
            className={`h-4 w-4 text-neutral-400 transition-transform dark:text-neutral-500 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {open && (
          <>
            <div
              className="fixed inset-0 z-10"
              aria-hidden="true"
              onClick={() => setOpen(false)}
            />
            <div
              id={listId}
              role="listbox"
              className="scrollbar-thumb-brand-100 absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded-xl border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
            >
              {communities.length === 0 && (
                <div className="px-3.5 py-2.5 text-sm text-neutral-400 dark:text-neutral-500">
                  No communities available
                </div>
              )}
              {communities.map((c) => {
                const isSelected = c.slug === selected?.slug;
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onSelect(c.slug);
                      setOpen(false);
                    }}
                    className="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800"
                  >
                    <span className="flex items-center gap-2">
                      <span className={`h-3 w-3 rounded ${c.color}`} />
                      {c.name}
                      {c.is_member && (
                        <span className="text-xs font-normal text-neutral-400 dark:text-neutral-500">
                          joined
                        </span>
                      )}
                    </span>
                    {isSelected && (
                      <Check
                        className="h-4 w-4 text-indigo-600 dark:text-indigo-400"
                        strokeWidth={3}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Image uploader                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Creates object URLs for the newly picked files (keyed by item id) and
 * revokes them when the list changes or the component unmounts.
 */
function useObjectUrls(items: ImageItem[]): Record<string, string> {
  const [urls, setUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const next: Record<string, string> = {};
    for (const item of items) {
      if (item.kind === "new") next[item.id] = URL.createObjectURL(item.file);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUrls(next);
    return () => Object.values(next).forEach((url) => URL.revokeObjectURL(url));
  }, [items]);

  return urls;
}

function ImageUploader({
  items,
  onAdd,
  onRemove,
}: {
  items: ImageItem[];
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const inputId = useId();
  const objectUrls = useObjectUrls(items);
  const total = items.length;

  const tile =
    "group relative aspect-square overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700";

  return (
    <Field label="Images" htmlFor={inputId} counter={`${total}/${MAX_IMAGES}`}>
      {total > 0 && (
        <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {items.map((item, i) => {
            // Existing images render straight from their URL; new files wait
            // for their object URL (one render after being picked).
            const src = item.kind === "existing" ? item.url : objectUrls[item.id];
            if (!src) return null;
            const alt = item.kind === "new" ? item.file.name : `Image ${i + 1}`;

            return (
              <div key={item.id} className={tile}>
                <Image
                  src={src}
                  alt={alt}
                  width={100}
                  height={100}
                  unoptimized
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  aria-label={`Remove ${alt}`}
                  className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900/70 text-white hover:bg-neutral-900"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {total < MAX_IMAGES && (
        <label
          htmlFor={inputId}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            onAdd(Array.from(e.dataTransfer.files));
          }}
          className={`flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed py-8 text-center transition-colors ${
            dragging
              ? "border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40"
              : "border-neutral-300 bg-neutral-50/70 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800/70 dark:hover:bg-neutral-800"
          }`}
        >
          <input
            id={inputId}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => {
              onAdd(Array.from(e.target.files ?? []));
              e.target.value = "";
            }}
          />
          <ImageIcon className="h-6 w-6 text-neutral-400 dark:text-neutral-500" />
          <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
            Drag and drop, or click to upload
          </span>
          <span className={HINT}>Up to {MAX_IMAGES} images</span>
        </label>
      )}
    </Field>
  );
}

/* -------------------------------------------------------------------------- */
/*  Poll editor                                                               */
/* -------------------------------------------------------------------------- */

function PollEditor({
  options,
  duration,
  onOptionsChange,
  onDurationChange,
}: {
  options: string[];
  duration: number;
  onOptionsChange: (options: string[]) => void;
  onDurationChange: (days: number) => void;
}) {
  return (
    <div>
      <span className={`${LABEL} mb-1.5 block`}>Poll options</span>
      <div className="space-y-2">
        {options.map((opt, i) => (
          // Options have no stable id and are only edited/removed by position.
          <div key={i} className="flex items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
              {i + 1}
            </span>
            <input
              type="text"
              value={opt}
              maxLength={MAX_POLL_OPTION_LENGTH}
              aria-label={`Option ${i + 1}`}
              onChange={(e) =>
                onOptionsChange(options.map((o, idx) => (idx === i ? e.target.value : o)))
              }
              placeholder={`Option ${i + 1}`}
              className={INPUT}
            />
            {options.length > MIN_POLL_OPTIONS && (
              <button
                type="button"
                aria-label={`Remove option ${i + 1}`}
                onClick={() => onOptionsChange(options.filter((_, idx) => idx !== i))}
                className="shrink-0 rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {options.length < MAX_POLL_OPTIONS && (
        <button
          type="button"
          onClick={() => onOptionsChange([...options, ""])}
          className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
        >
          <Plus className="h-3.5 w-3.5" />
          Add option
        </button>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className={LABEL}>Poll length</span>
        <div className="flex gap-2">
          {POLL_DURATIONS.map((d) => (
            <Chip
              key={d.id}
              active={duration === d.id}
              onClick={() => onDurationChange(d.id)}
            >
              {d.label}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Tag input                                                                 */
/* -------------------------------------------------------------------------- */

function TagInput({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const inputId = useId();

  const commit = () => {
    const tag = draft.trim().replace(/^#/, "").replace(/\s+/g, "");
    if (!tag || tags.length >= MAX_TAGS) {
      setDraft("");
      return;
    }
    const isDuplicate = tags.some((t) => t.toLowerCase() === tag.toLowerCase());
    if (!isDuplicate) onChange([...tags, tag]);
    setDraft("");
  };

  return (
    <Field label="Tags" htmlFor={inputId} optional counter={`${tags.length}/${MAX_TAGS}`}>
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
              onClick={() => onChange(tags.filter((x) => x !== t))}
              className="rounded p-0.5 text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-200"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {tags.length < MAX_TAGS && (
          <input
            id={inputId}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                commit();
              } else if (e.key === "Backspace" && !draft && tags.length) {
                onChange(tags.slice(0, -1));
              }
            }}
            onBlur={commit}
            placeholder={tags.length ? "Add another..." : "Type a tag and press Enter"}
            className="min-w-40 flex-1 bg-transparent py-1 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none dark:text-neutral-100 dark:placeholder:text-neutral-500"
          />
        )}
      </div>
    </Field>
  );
}

/* -------------------------------------------------------------------------- */
/*  Post form                                                                 */
/* -------------------------------------------------------------------------- */

interface PostFormProps {
  type: PostType;
  setType: (type: PostType) => void;
  /** "new" to create a post, otherwise the id of the post being edited. */
  action?: string;
  /** Pre-selects (and hides the picker for) a community. */
  slug?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

function PostForm({
  type,
  setType,
  action = "new",
  slug,
  onSuccess,
  onCancel,
}: PostFormProps) {
  const parsedId = Number(action);
  const postId = action === "new" || Number.isNaN(parsedId) ? null : parsedId;
  const isEditing = postId !== null;

  const [communitySlug, setCommunitySlug] = useState<string | undefined>(slug);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [pollDuration, setPollDuration] = useState<number>(3);
  const [notify, setNotify] = useState(true);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<PostingState | null>(null);
  const [post, setPost] = useState<Post | null>(null);

  const titleId = useId();
  const bodyId = useId();
  const { communities } = useCommunities();

  // Keep the latest setType without making the load effect depend on its identity.
  const setTypeRef = useRef(setType);
  useEffect(() => {
    setTypeRef.current = setType;
  }, [setType]);

  /* ---- load existing post (edit mode) ---- */
  useEffect(() => {
    if (postId === null) return;

    let cancelled = false;
    (async () => {
      try {
        const data = await getPost(postId, await getAccessToken());
        if (cancelled) return;

        setCommunitySlug(data.community.slug);
        setTitle(data.title);
        setTypeRef.current(data.post_type);
        setBody(data.content);
        setTags(data.tags ?? []);
        if (data.post_type === "poll" && data.polls) {
          setPollOptions(withMinimumOptions(data.polls.map((p) => p.text)));
        }
        if (data.post_type === "image" && data.images) {
          // Show saved images straight from their URLs. They're only
          // downloaded again at submit time (see `submit`).
          setImages(
            data.images.slice(0, MAX_IMAGES).map((url) => ({
              kind: "existing" as const,
              id: nextImageId(),
              url,
            })),
          );
        }
      } catch (err) {
        if (cancelled) return;
        console.error(err);
        setError("We couldn't load this post. Refresh the page to try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [postId]);

  /* ---- derived state ---- */
  const community = communities.find((c) => c.slug === communitySlug) ?? null;
  const filledOptions = pollOptions.map((o) => o.trim()).filter(Boolean);

  const missing: string[] = [];
  if (!community) missing.push("Choose a community");
  if (title.trim().length < MIN_TITLE) {
    missing.push(`Write a title (${MIN_TITLE}+ characters)`);
  }
  if (type === "image" && images.length === 0) missing.push("Add at least one image");
  if (type === "poll" && filledOptions.length < MIN_POLL_OPTIONS) {
    missing.push("Add at least two poll options");
  }
  const canPost = missing.length === 0 && !submitting && !loading;

  let statusText: string;
  if (error) statusText = error;
  else if (loading) statusText = "Loading post...";
  else if (missing.length === 0) statusText = "Ready to post";
  else statusText = missing[0];

  let submitLabel: string;
  if (isEditing) submitLabel = submitting ? "Updating..." : "Update";
  else submitLabel = submitting ? "Posting..." : "Post";

  /* ---- handlers ---- */
  const addImages = (incoming: File[]) =>
    setImages((prev) => {
      const room = MAX_IMAGES - prev.length;
      const accepted = incoming
        .filter((f) => f.type.startsWith("image/"))
        .slice(0, room)
        .map((file) => ({ kind: "new" as const, id: nextImageId(), file }));
      return accepted.length ? [...prev, ...accepted] : prev;
    });

  const removeImage = (id: string) =>
    setImages((prev) => prev.filter((item) => item.id !== id));

  const submit = async () => {
    if (!canPost || !community) return;

    setSubmitting(true);
    setError(null);

    // The API takes files, so saved images are downloaded again here, only
    // for the ones the user kept.
    let imageFiles: File[] | undefined;
    if (type === "image") {
      try {
        imageFiles = await Promise.all(
          images.map((item, i) =>
            item.kind === "new" ? item.file : urlToFile(item.url, i),
          ),
        );
      } catch (err) {
        console.error(err);
        setError("We couldn't read one of the saved images. Remove it and add it again.");
        setSubmitting(false);
        return;
      }
    }

    const payload: NewPost = {
      post_type: type,
      community_id: community.id,
      title: title.trim(),
      content: body.trim(),
      tags,
      poll_length: type === "poll" ? pollDuration : undefined,
      images: imageFiles,
      polls: type === "poll" ? filledOptions : undefined,
    };

    try {
      // TODO: `notify` is collected but not part of NewPost yet.
      if (isEditing) { 
        setState({ phase: "posting", mode: "updated" })
        const res = await updatePost(payload, postId); 
        setPost(res)
        setState({ phase: "success", mode: "updated" })
      }
      else { 
        setState({ phase: "posting", mode: "created" }) 
        const res = await createPost(payload); 
        setPost(res)
        setState({ phase: "success", mode: "created" }) 
      };
      onSuccess?.();
    } catch {
      if ( isEditing ) {
        setState({ phase: "error", mode: "created", message: "We couldn't update your post. Please try again." }) 
      }
      else {
        setState({ phase: "error", mode: "created", message: "We couldn't publish your post. Please try again." }) 
      }
      setError(
        isEditing
          ? "We couldn't update your post. Please try again."
          : "We couldn't publish your post. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const copy = COPY[type];

  return (
    <>
    {state && <PostStatusModal
        state={state} 
        onDismiss={()=>setSubmitting(false)}
        postTitle={post?.title}
        hasImages={post?.post_type === "image"}
        viewHref={post ? `/posts/detail/${post.id}`: undefined}
        onRetry={async ()=> await submit()}
        onCreateAnother={()=> redirect("/posts/new")}
        onContinueEditing={ ()=>post && redirect(`/posts/${post.id}`)}
        onGoHome={()=>redirect("/")}
      />}
      <div className="space-y-4">
        <PostTypeSelector value={type} onChange={setType} disabled={isEditing} />

        <div className={`${CARD} space-y-5`}>
          {!slug && (
            <CommunityPicker
              communities={communities}
              selected={community}
              onSelect={setCommunitySlug}
            />
          )}

          <Field label="Title" htmlFor={titleId} counter={`${title.length}/${MAX_TITLE}`}>
            <input
              id={titleId}
              type="text"
              value={title}
              maxLength={MAX_TITLE}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={copy.titlePlaceholder}
              className={INPUT}
            />
          </Field>

          {type === "image" && (
            <ImageUploader items={images} onAdd={addImages} onRemove={removeImage} />
          )}

          {type === "poll" && (
            <PollEditor
              options={pollOptions}
              duration={pollDuration}
              onOptionsChange={setPollOptions}
              onDurationChange={setPollDuration}
            />
          )}

          <Field label={copy.bodyLabel} htmlFor={bodyId}>
            <textarea
              id={bodyId}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={copy.bodyPlaceholder}
              rows={copy.bodyRows}
              className={`${INPUT} resize-y`}
            />
          </Field>

          <TagInput tags={tags} onChange={setTags} />

          {type === "question" && (
            <div className="flex items-center justify-between gap-4 rounded-xl bg-neutral-50 px-4 py-3 dark:bg-neutral-800">
              <div>
                <div className={LABEL}>Notify me about answers</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  Get a notification when someone answers this question
                </div>
              </div>
              <Switch checked={notify} onChange={setNotify} label="Notify me about answers" />
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
          <p
            role={error ? "alert" : "status"}
            className={`text-xs ${
              error ? "text-red-600 dark:text-red-400" : "text-neutral-400 dark:text-neutral-500"
            }`}
          >
            {statusText}
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled
              title="Drafts aren't available yet"
              className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              Save draft
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={!canPost}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400 dark:disabled:bg-neutral-700 dark:disabled:text-neutral-500"
            >
              {submitLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default PostForm;