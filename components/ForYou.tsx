"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { JobCard } from "@/components/JobCard";
import { fitScore } from "@/lib/insights";
import type { Job } from "@/lib/types";

export function ForYou({ jobs }: { jobs: Job[] }) {
  const [intent, setIntent] = useState<string | null>(null);

  useEffect(() => {
    setIntent(window.localStorage.getItem("meridian:intent"));
  }, []);

  const picks = useMemo(() => {
    if (!intent) return [];
    return [...jobs]
      .sort((a, b) => fitScore(b, intent) - fitScore(a, intent))
      .slice(0, 3);
  }, [jobs, intent]);

  if (!intent || picks.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] tracking-[0.22em] text-gold uppercase">For you</p>
          <h2 className="mt-1 font-display text-3xl leading-tight sm:text-4xl">
            From “{intent}”
          </h2>
        </div>
        <Link href={`/jobs?q=${encodeURIComponent(intent)}`} className="shrink-0 text-sm text-gold">
          Open search
        </Link>
      </div>
      <div className="grid gap-3">
        {picks.map((job) => (
          <JobCard key={job.id} job={job} query={intent} />
        ))}
      </div>
    </section>
  );
}
