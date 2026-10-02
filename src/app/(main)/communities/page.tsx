"use client";

import CommunityCard from "@/components/main/community-card";
import { CategoryId, Community } from "@/libs/types";
import { Building2, Code2, Cpu, GraduationCap, Sigma, Stethoscope } from "lucide-react";
import React, { useState } from "react";



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
    icon: Code2,
  },
  {
    id: "math",
    name: "Mathematics",
    members: "8.9k members",
    description: "Pure and applied math, algebra, calculus, and proofs.",
    category: "academic",
    icon: Sigma,
  },
  {
    id: "life",
    name: "Campus Life",
    members: "15.1k members",
    description: "Events, student housing, dining halls, and clubs.",
    category: "campus-life",
    icon: Building2,
  },
  {
    id: "scholarships",
    name: "Scholarships & Aid",
    members: "6.2k members",
    description:
      "Discover active grants, college funding options, and application tips.",
    category: "career",
    icon: GraduationCap,
  },
  {
    id: "engineering",
    name: "Engineering",
    members: "7.8k members",
    description: "Mechanical, electrical, aerospace, civil engineering help.",
    category: "academic",
    icon: Cpu,
  },
  {
    id: "premed",
    name: "Pre-Med",
    members: "5.4k members",
    description: "MCAT prep, biology study material, clinical experience.",
    category: "academic",
    icon: Stethoscope,
  },
];
 

export default function CommunitiesPage() {
  const [category, setCategory] = useState<CategoryId>("all");


  return (
    <div className="space-y-5">
      {/* Header + filter chips */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 sticky top-15 z-50">
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
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${active
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
      <div className="min-h-screen bg-[#f4f6f9] p-0">
        <div className="mx-auto grid max-w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {COMMUNITIES.map((c) => (
            category === "all" ? <CommunityCard key={c.id} community={c} /> : category === c.category && <CommunityCard key={c.id} community={c} />
          ))}
        </div>
      </div>
    </div>
  );
}

