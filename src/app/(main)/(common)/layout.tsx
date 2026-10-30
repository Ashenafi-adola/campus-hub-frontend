"use client"
import RightSideBar from "@/components/main/layout/right-side-bar";
import { usePosts } from "@/hooks/use-posts";
import { getCommunities } from "@/libs/api";
import { Community } from "@/libs/types";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react"


export default function SharedLaout({
    children
}:{
    children: React.ReactNode
}){
  const [trending, setTrending] = useState<Community[]>([]);
  useEffect(() => {
    getCommunities()
      .then(res => setTrending(res.length > 4 ? res.sort((a, b) => b.member_count - a.member_count).slice(0, 4) : res.sort((a, b) => b.member_count - a.member_count)))
  }, [])
  const { posts } = usePosts();
  const pathname = usePathname();

    return (
        <>
            {children}
            {  pathname === "/" || pathname === "/communities" &&
                <RightSideBar posts={posts} trending={trending} />
            }
        </>
    )
}