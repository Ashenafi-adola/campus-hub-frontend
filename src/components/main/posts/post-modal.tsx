"use client";

import React, { useState } from "react";

import PostForm from "./post-form";
import { PostType } from "@/libs/types";
import { useParams } from "next/navigation";


export default function CreatePostModal({show, setShow }:{show: boolean, setShow: (val: boolean) => void}) {
  const [type, setType] = useState<PostType>("discussion");
  const { slug } = useParams()
  
  return (
    <div
      className={`${!show && "hidden" } fixed inset-0 z-100 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4`}
        onClick={()=>setShow(false)}
    >
      <div
        onClick={(e)=>e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-post-title"
        className="relative flex h-dvh w-full max-w-2xl flex-col overflow-y-scroll scrollbar-none bg-white shadow-2xl dark:bg-neutral-900 sm:h-auto sm:max-h-[90dvh] sm:rounded-2xl sm:border sm:border-neutral-200 dark:sm:border-neutral-800"
      >
        
        <PostForm type={type} setType={setType} slug={String(slug)}/>
      </div>
    </div>
  );
}

