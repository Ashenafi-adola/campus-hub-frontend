"use server";

import { downvotePost, upvotePost } from "@/libs/api";
import { readSession } from "@/libs/auth/session";

export async function getAccessToken(): Promise<string> {
  const { access } = await readSession();
  if (!access) throw new Error("You must be signed in to vote.");
  return access;
}

export async function upvotePostForCurrentUser(id: number) {
  if (!id) throw new Error("A post id is required.");
  return upvotePost(id, await getAccessToken());
}

export async function downvotePostForCurrentUser(id: number) {
  if (!id) throw new Error("A post id is required.");
  return downvotePost(id, await getAccessToken());
}