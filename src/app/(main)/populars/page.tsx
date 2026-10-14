"use client"
import QuestionCard from "@/components/main/question-card";
import { Chip, EmptyState, PageHeader } from "@/components/shared/ui";
import { usePosts } from "@/hooks/use-posts";
import { plural } from "@/libs/format";
import { Flame } from "lucide-react";
import { useMemo, useState } from "react";

const RANGES = [
  { id: "day", label: "Today", hours: 24 },
  { id: "week", label: "This week", hours: 168 },
  { id: "month", label: "This month", hours: 720 },
  { id: "all", label: "All time", hours: Number.POSITIVE_INFINITY },
];

export default function PopularPage() {
  const [range, setRange] = useState("week");
  const hours = RANGES.find((r) => r.id === range)!.hours;
  const { posts } = usePosts();

  const ranked = useMemo(
    () => posts,
    [posts]
  );


  return (
    <div className="space-y-4">
      <PageHeader
        icon={Flame}
        title="Popular"
        subtitle="The most upvoted posts across CampusHub"
      >
        <div className="flex flex-wrap gap-2">
          {RANGES.map((r) => (
            <Chip
              key={r.id}
              active={range === r.id}
              onClick={() => setRange(r.id)}
            >
              {r.label}
            </Chip>
          ))}
        </div>
        <span className="text-sm text-neutral-400">
          {plural(ranked.length, "post", "posts")}
        </span>
      </PageHeader>

      {ranked.length === 0 ? (
        <EmptyState
          icon={Flame}
          title="Nothing popular yet"
          text="No posts in this time range yet. Try a wider range."
        />
      ) : (
        ranked.map((p) => (
          <QuestionCard
            key={p.id}
            post={p}
          />
        ))
      )}
    </div>
  );
}