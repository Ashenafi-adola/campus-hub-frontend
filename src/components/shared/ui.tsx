

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
    <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-14 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50">
        <Icon className="h-5 w-5 text-indigo-600" />
      </div>
      <h3 className="mt-4 font-semibold text-neutral-900">{title}</h3>
      <p className="mx-auto mt-1 max-w-xs text-sm text-neutral-500">{text}</p>
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
          : "bg-[#eef1f6] text-neutral-600 hover:bg-neutral-200"
      }`}
    >
      {children}
      {count !== undefined && (
        <span className={active ? "text-indigo-200" : "text-neutral-400"}>
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
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50">
            <Icon className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">{title}</h1>
            <p className="text-sm text-neutral-500">{subtitle}</p>
          </div>
        </div>
        {right}
      </div>
      {children && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-4">
          {children}
        </div>
      )}
    </div>
  );
}