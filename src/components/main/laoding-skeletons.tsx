import React from "react";
function Bone({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-neutral-200 ${className}`} />;
}

export function CommunityCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      {/* Banner */}
      <div className="relative h-20 animate-pulse bg-neutral-200" />

      <div className="flex flex-1 flex-col px-5 pb-5">
        {/* Icon overlapping the banner */}
        <div className="-mt-7">
          <Bone className="h-14 w-14 rounded-2xl border-4 border-white" />
        </div>

        <Bone className="mt-3 h-4 w-2/3" />
        <Bone className="mt-2 h-3 w-1/3" />

        <div className="mt-3 space-y-1.5">
          <Bone className="h-3 w-full" />
          <Bone className="h-3 w-4/5" />
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-neutral-100 pt-4">
          <Bone className="h-9 flex-1 rounded-lg" />
          <Bone className="h-9 w-9 shrink-0 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function CommunityGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <CommunityCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function PostCardSkeleton() {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      {/* Author row */}
      <div className="flex items-center gap-2.5">
        <Bone className="h-9 w-9 shrink-0 rounded-full" />
        <div className="space-y-1.5">
          <Bone className="h-3.5 w-36" />
          <Bone className="h-3 w-20" />
        </div>
      </div>

      {/* Title */}
      <Bone className="mt-4 h-5 w-3/4" />

      {/* Body */}
      <div className="mt-2.5 space-y-1.5">
        <Bone className="h-3.5 w-full" />
        <Bone className="h-3.5 w-full" />
        <Bone className="h-3.5 w-2/3" />
      </div>

      {/* Tags */}
      <div className="mt-3 flex gap-2">
        <Bone className="h-6 w-16 rounded-md" />
        <Bone className="h-6 w-20 rounded-md" />
        <Bone className="h-6 w-14 rounded-md" />
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3.5">
        <Bone className="h-7 w-16 rounded-full" />
        <div className="flex items-center gap-4">
          <Bone className="h-4 w-20" />
          <Bone className="h-4 w-14" />
          <Bone className="h-4 w-4" />
          <Bone className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

export function PostFeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function PopularPostsSkeleton({ count = 3 }: { count?: number }) {

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex-col gap-2">
          <Bone className="h-3.5 my-1 w-full" />
          <Bone className="h-3.5 w-2/4" />
          <div className="mt-2.5 space-y-1.5">
            <Bone className="h-3.5 w-1/4" />
          </div>
        </div>
      ))}
    </>
  )
}
export function TrendingCommunitiesSkeleton({ count = 3 }: { count?: number }) {

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <Bone className="h-3.5 my-1 w-full" />
            <Bone className="h-3.5 w-1/3" />
          </div>
          <div className="mt-2.5 space-y-1.5">
            <Bone className="p-4 w-full" />
          </div>
        </div>
      ))}
    </>
  )
}