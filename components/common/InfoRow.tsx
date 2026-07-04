"use client";

export function InfoRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "coral" | "mint";
}) {
  const color =
    tone === "coral"
      ? "text-coral"
      : tone === "mint"
        ? "text-mint"
        : "text-ink";
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-sm text-quiet">{label}</span>
      <span className={`text-right font-semibold ${color}`}>{value}</span>
    </div>
  );
}
