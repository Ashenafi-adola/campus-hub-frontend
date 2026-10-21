import { PostType } from "@/libs/types";
import { BarChart3, CircleQuestionMark, Flame, ImageIcon, MessageSquare, Trophy, Zap } from "lucide-react";

export const RANGES = [
  { id: "day", label: "Today", hours: 24 },
  { id: "week", label: "This week", hours: 168 },
  { id: "month", label: "This month", hours: 720 },
  { id: "all", label: "All time", hours: Number.POSITIVE_INFINITY },
];

export const SORTS: { id: SortId; label: string; hint: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "hot", label: "Hot", hint: "Votes weighted by how recent they are", icon: Flame },
  { id: "top", label: "Top", hint: "Most total upvotes", icon: Trophy },
  { id: "rising", label: "Rising", hint: "Gaining votes fastest today", icon: Zap },
];

export type SortId = "hot" | "top" | "rising";


export const TYPE_META: Record<
  PostType,
  { label: string; chip: string; icon: React.ComponentType<{ className?: string }> }
> = {
  question: { label: "Question", chip: "bg-indigo-50 text-indigo-600", icon: CircleQuestionMark },
  discussion: { label: "Discussion", chip: "bg-emerald-50 text-emerald-600", icon: MessageSquare },
  image: { label: "Image", chip: "bg-amber-50 text-amber-600", icon: ImageIcon },
  poll: { label: "Poll", chip: "bg-violet-50 text-violet-600", icon: BarChart3 },
};