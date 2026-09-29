"use client";

import React, { useState } from "react";

type CategoryId = "all" | "academic" | "campus-life" | "career";

interface Community {
  id: string;
  name: string;
  members: string;
  description: string;
  category: Exclude<CategoryId, "all">;
}

const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "academic", label: "Academic" },
  { id: "campus-life", label: "Campus Life" },
  { id: "career", label: "Career" },
];

const COMMUNITIES: Community[] = [
  {
    id: "cs",
    name: "Computer Science",
    members: "12.4k members",
    description:
      "Algorithms, systems, machine learning, and everything in between.",
    category: "academic",
  },
  {
    id: "math",
    name: "Mathematics",
    members: "8.9k members",
    description: "Pure and applied math, algebra, calculus, and proofs.",
    category: "academic",
  },
  {
    id: "life",
    name: "Campus Life",
    members: "15.1k members",
    description: "Events, student housing, dining halls, and clubs.",
    category: "campus-life",
  },
  {
    id: "scholarships",
    name: "Scholarships & Aid",
    members: "6.2k members",
    description:
      "Discover active grants, college funding options, and application tips.",
    category: "career",
  },
  {
    id: "engineering",
    name: "Engineering",
    members: "7.8k members",
    description: "Mechanical, electrical, aerospace, civil engineering help.",
    category: "academic",
  },
  {
    id: "premed",
    name: "Pre-Med",
    members: "5.4k members",
    description: "MCAT prep, biology study material, clinical experience.",
    category: "academic",
  },
];

export default function CommunitiesPage() {
  const [category, setCategory] = useState<CategoryId>("all");
  const [joined, setJoined] = useState<Set<string>>(new Set());

  const visible =
    category === "all"
      ? COMMUNITIES
      : COMMUNITIES.filter((c) => c.category === category);

  const toggleJoin = (id: string) =>
    setJoined((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
      <div className="space-y-5 md:ml-60">
        {/* Header + filter chips */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <h1 className="text-2xl font-bold text-neutral-900">
            Explore Communities
          </h1>
          <div className="mt-4 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const active = category === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-indigo-600 text-white"
                      : "bg-[#eef1f6] text-neutral-600 hover:bg-neutral-200"
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Community grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((c) => {
            const isJoined = joined.has(c.id);
            return (
              <div
                key={c.id}
                className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-50" />
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-neutral-900">
                      {c.name}
                    </h3>
                    <p className="text-xs text-neutral-400">{c.members}</p>
                  </div>
                </div>

                <p className="mt-3 line-clamp-2 flex-1 text-sm leading-relaxed text-neutral-600">
                  {c.description}
                </p>

                <button
                  onClick={() => toggleJoin(c.id)}
                  className={`mt-4 self-start rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
                    isJoined
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                  }`}
                >
                  {isJoined ? "Joined" : "Join Community"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
  );
}
