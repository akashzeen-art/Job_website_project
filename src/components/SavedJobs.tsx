import { Link } from "react-router-dom";
import { JobCard } from "@/components/JobCard";
import { useSavedJobs } from "@/components/SaveButton";
import type { Job } from "@/lib/types";

export function SavedJobs({ jobs }: { jobs: Job[] }) {
  const { ids } = useSavedJobs();
  const saved = jobs.filter((job) => ids.includes(job.id));

  if (ids.length === 0) {
    return (
      <div className="border border-dashed border-line px-5 py-16 text-center">
        <p className="font-display text-2xl">Nothing kept yet</p>
        <p className="mx-auto mt-2 max-w-md text-muted">
          Bookmark from the board. It stays on this phone only.
        </p>
        <Link
          to="/jobs"
          className="mt-6 inline-flex h-11 items-center bg-wine px-5 text-xs tracking-[0.16em] text-text uppercase"
        >
          Open the board
        </Link>
      </div>
    );
  }

  if (saved.length === 0) {
    return (
      <p className="border border-dashed border-line px-5 py-16 text-center text-muted">
        Those roles have left the board.
      </p>
    );
  }

  return (
    <div className="grid gap-3">
      {saved.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
