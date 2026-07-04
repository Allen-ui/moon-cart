"use client";

export function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5"
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}
