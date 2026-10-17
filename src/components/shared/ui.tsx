import { AuthUser } from "@/libs/auth/types";
import { colorFor, getInitials, plural } from "@/libs/format";
import Image from "next/image";
import { useState } from "react";


export function EmptyState({
  icon: Icon,
  title,
  text,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-14 text-center dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950">
        <Icon className="h-5 w-5 text-indigo-600" />
      </div>
      <h3 className="mt-4 font-semibold text-neutral-900 dark:text-neutral-100">{title}</h3>
      <p className="mx-auto mt-1 max-w-xs text-sm text-neutral-500 dark:text-neutral-400">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}


export function Chip({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
        active
          ? "bg-indigo-600 text-white"
          : "bg-[#eef1f6] text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
      }`}
    >
      {children}
      {count !== undefined && (
        <span className={active ? "text-indigo-200" : "text-neutral-400 dark:text-neutral-500"}>
          {count}
        </span>
      )}
    </button>
  );
}

export function PageHeader({
  icon: Icon,
  title,
  subtitle,
  right,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  right?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 w-full">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950">
            <Icon className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{title}</h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{subtitle}</p>
          </div>
        </div>
        {right}
      </div>
      {children && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-4 dark:border-neutral-800">
          {children}
        </div>
      )}
    </div>
  );
}


export function Avatar({
  user,
  size = "h-9 w-9",
  textSize = "text-xs",
}: {
  user: AuthUser | null;
  size?: string;
  textSize?: string;
}) {
  const fullName = user?.first_name + " " + user?.last_name;
  return (
    <div
      className={`flex ${size} shrink-0 items-center justify-center rounded-full font-semibold text-white ${textSize} ${colorFor(
        fullName
      )}`}
    >
      {user?.avatar ? <Image
        src={user.avatar || ""}
        alt={user.username}
        width={100}
        height={100}
        unoptimized
        className="h-full w-full rounded-full object-cover"
      /> :
        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
          <span className="font-semibold text-white">
            {getInitials(fullName)}
          </span>
        </div>}
    </div>
  );
}

export function PollBlock({ options, o_votes }: { options: string[], o_votes: number[] }) {
  const [choice, setChoice] = useState<string | null>(null);
  const total =
    o_votes.reduce((sum, i) => sum + o_votes[i], 0) + (choice ? 1 : 0);

  return (
    <div className="mt-3 space-y-2">
      {options.map((o, i) => {
        const votes = o_votes[i] + (choice === o ? 1 : 0);
        const pct = total ? Math.round((votes / total) * 100) : 0;
        const selected = choice === o;
        return (
          <button
            key={i}
            onClick={() => setChoice(selected ? null : o)}
            className={`relative w-full overflow-hidden rounded-xl border px-3.5 py-2.5 text-left text-sm font-medium transition-colors ${
              selected
                ? "border-indigo-500 text-indigo-700 dark:border-indigo-400 dark:text-indigo-300"
                : "border-neutral-200 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            }`}
          >
            {choice !== null && (
              <span
                className="absolute inset-y-0 left-0 bg-indigo-100/70 dark:bg-indigo-900/50"
                style={{ width: `${pct}%` }}
              />
            )}
            <span className="relative flex items-center justify-between">
              <span>{o}</span>
              {choice !== null && (
                <span className="text-xs font-bold">{pct}%</span>
              )}
            </span>
          </button>
        );
      })}
      <p className="text-xs text-neutral-400 dark:text-neutral-500">
        {plural(total, "vote", "votes")}
        {choice === null && " · vote to see results"}
      </p>
    </div>
  );
}