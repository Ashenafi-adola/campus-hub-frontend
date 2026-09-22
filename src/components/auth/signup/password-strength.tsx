export function PasswordStrengthBar({ password }: { password: string }) {
  const score = Math.min(
    3,
    Math.floor(password.length / 4) + (/[A-Z]/.test(password) ? 1 : 0)
  );
  const labels = ["Weak", "Medium", "Strong"];
  const colors = ["bg-red-500", "bg-emerald-500", "bg-emerald-600"];

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${
              i <= score ? colors[score] : "bg-neutral-200"
            }`}
          />
        ))}
      </div>
      <p className={`mt-1 text-xs font-medium ${
        score === 0 ? "text-red-500" : score === 1 ? "text-emerald-600" : "text-emerald-700"
      }`}>
        {labels[score]} password strength
      </p>
    </div>
  );
}