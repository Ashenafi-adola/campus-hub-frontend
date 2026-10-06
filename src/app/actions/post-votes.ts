"use server";

import { downvotePost, upvotePost } from "@/libs/api";
import { readSession } from "@/libs/auth/session";

export async function getAccessToken(): Promise<string> {
  const { access } = await readSession();
  if (!access) throw new Error("You must be signed in to vote.");
  return access;
}

export async function upvotePostForCurrentUser(slug: string) {
  if (!slug.trim()) throw new Error("A post slug is required.");
  return upvotePost(slug, await getAccessToken());
}

export async function downvotePostForCurrentUser(slug: string) {
  if (!slug.trim()) throw new Error("A post slug is required.");
  return downvotePost(slug, await getAccessToken());
}