import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { fetchJobDetail, fetchLiveJobs, getInstantJobs } from "@/lib/jobs";
import { getCatalogJobs } from "@/lib/catalog";
import type { Job, JobDetail } from "@/lib/types";

type JobsContextValue = {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  getDetail: (id: string) => Promise<JobDetail | null>;
};

const JobsContext = createContext<JobsContextValue | null>(null);

function mergeCatalogAndLive(live: Job[]): Job[] {
  const catalog = getCatalogJobs();
  if (live.length === 0) return catalog;
  const seen = new Set(catalog.map((job) => job.id));
  const extra = live.filter((job) => !seen.has(job.id));
  return extra.length ? catalog.concat(extra) : catalog;
}

export function JobsProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>(() => {
    try {
      sessionStorage.removeItem("meridian:jobs-cache:v3");
      sessionStorage.removeItem("meridian:jobs-cache:v2");
    } catch {
      /* ignore */
    }
    return getInstantJobs();
  });
  const [loading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchLiveJobs()
      .then((live) => {
        if (!alive || live.length === 0) return;
        setJobs(mergeCatalogAndLive(live));
      })
      .catch((err: unknown) => {
        if (alive) setError(err instanceof Error ? err.message : "Could not load live roles");
      });
    return () => {
      alive = false;
    };
  }, []);

  const getDetail = useCallback((id: string) => fetchJobDetail(jobs, id), [jobs]);

  return (
    <JobsContext.Provider value={{ jobs, loading, error, getDetail }}>
      {children}
    </JobsContext.Provider>
  );
}

export function useJobs() {
  const value = useContext(JobsContext);
  if (!value) throw new Error("useJobs must be used inside JobsProvider");
  return value;
}
