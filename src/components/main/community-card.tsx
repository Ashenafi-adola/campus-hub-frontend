"use client"

import { CategoryId, Community } from '@/libs/types';
import { ArrowUpRight, Check, Sigma, Users } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react'

const CATEGORY_META: Record<
  CategoryId,
  {
    label: string;
    badge: string;
    banner: string;
    iconBg: string;
    iconColor: string;
  }
> = {
  academic: {
    label: "Academic",
    badge: "bg-white/90 text-indigo-600",
    banner: "from-indigo-500 to-indigo-700",
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
  },
  "campus-life": {
    label: "Campus Life",
    badge: "bg-white/90 text-amber-600",
    banner: "from-amber-400 to-orange-600",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  career: {
    label: "Career",
    badge: "bg-white/90 text-emerald-600",
    banner: "from-emerald-400 to-emerald-700",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  all: {
    label: "",
    badge: "",
    banner: "",
    iconBg: "",
    iconColor: ""
  }
};

const cats:CategoryId[] = ["all" , "academic" , "campus-life" , "career"]
 

function CommunityCard({ community }: { community: Community }) {
  const [joined, setJoined] = useState(false);
  const meta = CATEGORY_META[cats[2]];
  const Icon = Sigma;
 
  return (
    <Link href={`/communities/${community.slug}`} className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-shadow hover:shadow-xl hover:shadow-gray-300 hover:scale-101">
      {/* Banner */}
      <div
        className={`relative h-20 bg-linear-to-br ${meta.banner}`}
      >
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />
        <span
          className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm ${meta.badge}`}
        >
          {meta.label}
        </span>
      </div>
 
      <div className="flex flex-1 flex-col px-5 pb-5">
        {/* Icon overlapping the banner */}
        <div
          className={`-mt-7 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-4 border-white shadow-sm ${meta.iconBg}`}
        >
          <Icon className={`h-6 w-6 ${meta.iconColor}`} />
        </div>
 
        <h3 className="mt-3 font-semibold text-neutral-900">
          {community.name}
        </h3>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-neutral-400">
          <Users className="h-3 w-3" />
          {community.member_count}
        </p>
 
        <p className="mt-2.5 line-clamp-2 flex-1 text-sm leading-relaxed text-neutral-500">
          {community.description}
        </p>
 
        <div className="mt-4 flex items-center gap-2 border-t border-neutral-100 pt-4">
          <button
            onClick={(e) => {setJoined((v) => !v); e.stopPropagation()}}
            className={`flex-1 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
              joined
                ? "bg-neutral-900 text-white hover:bg-neutral-800"
                : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
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
          <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neutral-200 text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-neutral-700">
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}
export default CommunityCard