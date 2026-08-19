import { Suspense } from "react";
import { JobsExplorer } from "@/components/JobsExplorer";
import { LoadingPanel } from "@/components/LoadingPanel";
import { getJobs } from "@/lib/jobs";

export default async function JobsPage() {
  const jobs = await getJobs();
  const companyCounts = new Map<string, { slug: string; name: string; count: number }>();
  for (const job of jobs) {
    const current = companyCounts.get(job.companySlug);
    if (current) current.count += 1;
    else companyCounts.set(job.companySlug, { slug: job.companySlug, name: job.company, count: 1 });
  }
  const companies = [...companyCounts.values()].sort((a, b) => b.count - a.count);
  const departments = [...new Set(jobs.map((job) => job.department))].sort();

  return (
    <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-10">
      <p className="text-[11px] tracking-[0.24em] text-gold uppercase">The board</p>
      <h1 className="mt-1 font-display text-[2rem] leading-tight sm:text-5xl">India, in residence</h1>
      <p className="mt-2 hidden max-w-xl text-muted sm:block">
        Search as you would ask a person. Filter by city when you want the room quieter.
      </p>
      <div className="mt-5 sm:mt-8">
        <Suspense fallback={<LoadingPanel label="Opening the board" />}>
          <JobsExplorer jobs={jobs} companies={companies} departments={departments} />
        </Suspense>
      </div>
    </div>
  );
}
