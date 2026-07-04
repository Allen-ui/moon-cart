"use client";

export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[24px] bg-white p-5 shadow-soft">
      <div className="text-sm text-quiet">{label}</div>
      <div className="mt-3 text-3xl font-semibold">{value}</div>
    </div>
  );
}
