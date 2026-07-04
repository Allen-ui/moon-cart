"use client";

export function Centered({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center text-center">
      {children}
    </section>
  );
}
