"use client";

import { ArrowLeft } from "lucide-react";

export function Header({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack: () => void;
  right?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 -mx-4 flex items-center justify-between bg-paper px-4 py-3">
      <button
        className="rounded-full bg-white p-3 shadow-soft"
        onClick={onBack}
        aria-label="返回"
      >
        <ArrowLeft size={18} />
      </button>
      <h1 className="text-lg font-semibold">{title}</h1>
      <div className="w-11">{right}</div>
    </header>
  );
}
