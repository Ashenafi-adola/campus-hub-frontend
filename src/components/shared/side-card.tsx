export function SideCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">{title}</h3>
      {subtitle && <p className="text-xs text-neutral-400 dark:text-neutral-500">{subtitle}</p>}
      <div className="mt-3">{children}</div>
    </div>
  );
}