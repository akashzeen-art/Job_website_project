"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "meridian:saved";

function readSaved(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function useSavedJobs() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds(readSaved());
    function onStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY) setIds(readSaved());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function toggle(id: string) {
    setIds((current) => {
      const next = current.includes(id)
        ? current.filter((item) => item !== id)
        : [id, ...current];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  return { ids, toggle, saved: (id: string) => ids.includes(id) };
}

export function SaveButton({ id }: { id: string; compact?: boolean }) {
  const { saved, toggle } = useSavedJobs();
  const isSaved = saved(id);

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggle(id);
      }}
      aria-pressed={isSaved}
      aria-label={isSaved ? "Remove from saved" : "Save role"}
      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center border transition ${
        isSaved
          ? "border-gold bg-gold/10 text-gold"
          : "border-line text-muted hover:border-gold hover:text-text"
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} aria-hidden>
        <path
          d="M7 4.5h10a1 1 0 0 1 1 1V20l-6-3.2L6 20V5.5a1 1 0 0 1 1-1Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
