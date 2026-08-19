import { SavedJobs } from "@/components/SavedJobs";
import { LoadingPanel } from "@/components/LoadingPanel";
import { useJobs } from "@/context/JobsContext";

export function SavedPage() {
  const { jobs, loading } = useJobs();
  if (loading) return <LoadingPanel />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <p className="text-[11px] tracking-[0.24em] text-gold uppercase">Shortlist</p>
      <h1 className="mt-2 font-display text-4xl leading-tight sm:text-5xl">Kept in this browser</h1>
      <p className="mt-3 max-w-xl text-muted">
        Nothing is sent onward. A private note to yourself, not an application.
      </p>
      <div className="mt-8">
        <SavedJobs jobs={jobs} />
      </div>
    </div>
  );
}
