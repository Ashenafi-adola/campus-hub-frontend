import { getPollVotes, votePoll } from "@/libs/api";
import { AuthUser } from "@/libs/auth/types";
import { colorFor, getInitials, plural } from "@/libs/format";
import { PollOption, User } from "@/libs/types";
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
      className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${active
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
  size = "h-10 w-10",
  textSize = "text-xs",
}: {
  user: AuthUser | null | User;
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

export function PollBlock({ options }: { options: PollOption[] }) {
  const [selected, setSelected] = useState<number | null>(
    () => options.find((option) => option.voted)?.id ?? null
  );
  const [votes, setVotes] = useState<Record<number, number>>(() =>
    Object.fromEntries(options.map((option) => [option.id, option.option_votes]))
  );
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const total = Object.values(votes).reduce((sum, count) => sum + count, 0);

  const refreshVotes = async () => {
    const results = await Promise.all(options.map((option) => getPollVotes(option.id)));
    setVotes(
      Object.fromEntries(
        options.map((option, index) => [option.id, results[index].option_votes])
      )
    );
  };

  const handleVote = async (optionId: number) => {
    if (isVoting) return;

    setIsVoting(true);
    setError(null);

    let voteSubmitted = false;
    try {
      await votePoll(optionId);
      voteSubmitted = true;
      setSelected((current) => (current === optionId ? null : optionId));
      await refreshVotes();
    } catch (cause) {
      setError(
        voteSubmitted
          ? "Your vote was submitted, but the results could not be refreshed."
          : cause instanceof Error
            ? cause.message
            : "Your vote could not be submitted."
      );
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="mt-3 space-y-2">
      {options.map((option) => (
        <PollRow
          key={option.id}
          option={option}
          votes={votes[option.id] ?? option.option_votes}
          total={total}
          selected={selected}
          isVoting={isVoting}
          onVote={handleVote}
        />
      ))}
      <p className="text-xs text-neutral-400 dark:text-neutral-500">
        {plural(total, "vote", "votes")}
        {selected === null && " · vote to see results"}
      </p>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function PollRow({
  option,
  votes,
  total,
  selected,
  isVoting,
  onVote,
}: {
  option: PollOption;
  votes: number;
  total: number;
  selected: number | null;
  isVoting: boolean;
  onVote: (id: number) => void;
}) {
  const pct = total ? Math.round((votes / total) * 100) : 0;

  return (
    <button
      type="button"
      onClick={() => onVote(option.id)}
      disabled={isVoting}
      aria-pressed={selected === option.id}
      className={`relative w-full overflow-hidden rounded-xl border px-3.5 py-2.5 text-left text-sm font-medium transition-colors ${selected === option.id
        ? "border-indigo-500 text-indigo-700 dark:border-indigo-400 dark:text-indigo-300"
        : "border-neutral-200 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
        }`}
    >
      <span
        className="absolute inset-y-0 left-0 bg-indigo-100/70 transition-[width] duration-500 ease-out motion-reduce:transition-none dark:bg-indigo-900/50"
        style={{ width: selected !== null ? `${pct}%` : "0%" }}
      />
      <span className="relative flex items-center justify-between">
        <span>{option.text}</span>
        {selected !== null && (
          <span className="text-xs font-bold">{pct}%</span>
        )}
      </span>
    </button>
  );
}