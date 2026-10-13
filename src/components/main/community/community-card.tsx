"use client"

import { CategoryId, Community } from '@/libs/types';
import { ArrowUpRight, Check, Users } from 'lucide-react';
import Link from 'next/link';
import Image from "next/image";
import React, { useState } from 'react'
import { joinLeaveCommunity } from '@/libs/api';

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

const cats: CategoryId[] = ["all", "academic", "campus-life", "career"]


function CommunityCard({ community }: { community: Community }) {
  const [joined, setJoined] = useState<boolean>(Boolean(community.is_member));
  const meta = CATEGORY_META[cats[2]];

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-shadow hover:shadow-xl hover:shadow-gray-300 hover:scale-101">
      {/* Banner */}
      {community.banner ? (
        <div className="relative h-20 w-full">
          <Image
            fill
            src={typeof (community.banner) === "object" ? community.banner.name : community.banner}
            alt={community.name}
            unoptimized
            className="object-cover"
          />
        </div>
      ) : (
        <div
          className="relative h-20 bg-neutral-900"
          style={{
            backgroundImage:
              "linear-gradient(120deg, rgba(79,70,229,0.5), rgba(236,72,153,0.4)), repeating-linear-gradient(45deg, rgba(255,255,255,0.06) 0 2px, transparent 2px 40px)",
          }}
        />
      )}

      <div className="flex flex-1 flex-col px-5 pb-5">
        { }
        <div
          className={`-mt-7 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl z-5 border-4 border-white bg-amber-200 shadow-lg shadow-gray-700 ${meta.iconBg}`}
        >
          {community.icon ? <Image
            width={32}
            height={32}
            src={typeof (community.icon) === "object" ? community.icon.name : community.icon}
            alt={community.name}
            unoptimized
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          /> : <span className='font-bold text-black text-2xl'>{community.name.slice(0, 2).toUpperCase()}</span>}
        </div>

        <Link href={`/communities/${community.slug}`} className="mt-3 font-semibold text-neutral-900">
          {community.name}
        </Link>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-neutral-400">
          <Users className="h-3 w-3" />
          {community.member_count}
        </p>

        <p className="mt-2.5 line-clamp-2 flex-1 text-sm leading-relaxed text-neutral-500">
          {community.description}
        </p>

        <div
          className="mt-4 flex items-center gap-2 border-t border-neutral-100 pt-4">
          <button
            onClick={async () => { const res = await joinLeaveCommunity(joined, community.slug); setJoined(res.is_member); }}
            className={`flex-1 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${joined
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
          <Link href={`/communities/${community.slug}`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neutral-200 text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-neutral-700">
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
export default CommunityCard