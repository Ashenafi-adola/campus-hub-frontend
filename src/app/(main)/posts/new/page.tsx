"use client"

import PostForm from "@/components/main/posts/post-form";
import { BarChart3, HelpCircle, ImageIcon, Lightbulb, MessageSquare } from "lucide-react";
import { useState } from "react";


type PostType = "question" | "discussion" | "image" | "poll";

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

export default function CreatePostPage() {
  const [type, setType] = useState<PostType>("question");
  
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
        <PostForm type={type} setType={setType}/>

        {/* ---------------- Tips ---------------- */}
        <div className="space-y-4">
          <div className="sticky top-20 z-12 space-y-4">
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
