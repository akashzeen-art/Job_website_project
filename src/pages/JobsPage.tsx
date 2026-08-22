import { JobsExplorer } from "@/components/JobsExplorer";
import { LoadingPanel } from "@/components/LoadingPanel";
import { useJobs } from "@/context/JobsContext";

export function JobsPage() {
  const { jobs, loading } = useJobs();
  if (loading) return <LoadingPanel label="Opening the board" />;

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
      <h1 className="mt-1 font-display text-[2rem] leading-tight sm:text-5xl">
        {jobs.length.toLocaleString("en-IN")}+ India roles
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
        Survey · data entry · typing · content · WFH · freelance · Excel · fresher — plus live global tech.
      </p>
      <div className="mt-5 sm:mt-8">
        <JobsExplorer jobs={jobs} companies={companies} departments={departments} />
      </div>
    </div>
  );
}
