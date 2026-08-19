import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { fetchAllJobs, fetchJobDetail } from "@/lib/jobs";
import type { Job, JobDetail } from "@/lib/types";

type JobsContextValue = {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  getDetail: (id: string) => Promise<JobDetail | null>;
};

const JobsContext = createContext<JobsContextValue | null>(null);

export function JobsProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchAllJobs()
      .then((next) => {
        if (alive) setJobs(next);
      })
      .catch((err: unknown) => {
        if (alive) setError(err instanceof Error ? err.message : "Could not load roles");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const getDetail = useCallback((id: string) => fetchJobDetail(jobs, id), [jobs]);

  return (
    <JobsContext.Provider
      value={{
        jobs,
        loading,
        error,
        getDetail,
      }}
    >
      {children}
    </JobsContext.Provider>
  );
}

export function useJobs() {
  const value = useContext(JobsContext);
  if (!value) throw new Error("useJobs must be used inside JobsProvider");
  return value;
}
