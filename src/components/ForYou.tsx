import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
    const needle = intent.toLowerCase();
    const tokens = needle.split(/\s+/).filter((t) => t.length > 2);
    const scored: { job: Job; score: number }[] = [];
    // Scan at most 2.5k roles for speed; early-exit once we have a strong shortlist.
    const limit = Math.min(jobs.length, 2500);
    for (let i = 0; i < limit; i += 1) {
      const job = jobs[i];
      const hay = `${job.title} ${job.company} ${job.city} ${job.department}`.toLowerCase();
      if (tokens.length && !tokens.some((token) => hay.includes(token))) continue;
      scored.push({ job, score: fitScore(job, intent) });
    }
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((row) => row.job);
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
        <Link to={`/?q=${encodeURIComponent(intent)}`} className="shrink-0 text-sm text-gold">
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
