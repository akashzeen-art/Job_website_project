import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CompanyMark } from "@/components/CompanyMark";
import { JobCard } from "@/components/JobCard";
import { JobDescription } from "@/components/JobDescription";
import { LoadingPanel } from "@/components/LoadingPanel";
import { SaveButton } from "@/components/SaveButton";
import { COMPANY_BY_SLUG } from "@/lib/companies";
import { atsLabel, timeAgo } from "@/lib/format";
import { fitScore, fitWhy, jobTags } from "@/lib/insights";
import { useJobs } from "@/context/JobsContext";
import { NotFoundPage } from "@/pages/NotFoundPage";
import type { JobDetail } from "@/lib/types";

export function JobDetailPage() {
  const { id } = useParams();
  const { jobs, loading, getDetail } = useJobs();
  const [detail, setDetail] = useState<JobDetail | null | undefined>(undefined);

  useEffect(() => {
    if (!id || loading) return;
    let alive = true;
    getDetail(id).then((next) => {
      if (alive) setDetail(next);
    });
    return () => {
      alive = false;
    };
  }, [id, loading, getDetail, jobs]);

  if (loading || detail === undefined) return <LoadingPanel label="Opening the role" />;
  if (!detail) return <NotFoundPage />;

  const job = detail;
  const company = COMPANY_BY_SLUG[job.companySlug];
  const score = fitScore(job);
  const similar = jobs
    .filter(
      (item) =>
        item.id !== job.id && (item.department === job.department || item.city === job.city),
    )
    .slice(0, 3);

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,1fr)_280px]">
      <article>
        <Link to="/jobs" className="text-sm text-muted hover:text-text">
          ← Board
        </Link>
        <div className="mt-5 border border-line bg-surface p-4 sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <CompanyMark name={job.company} website={company?.website ?? "https://example.com"} size={48} />
            <div className="min-w-0 flex-1">
              <p className="text-xs tracking-[0.14em] text-muted uppercase">
                <Link to={`/companies/${job.companySlug}`} className="hover:text-text">
                  {job.company}
                </Link>
                {company ? ` · ${company.hq}` : ""}
              </p>
              <h1 className="mt-2 font-display text-[1.85rem] leading-tight sm:text-4xl">{job.title}</h1>
              <p className="mt-2 text-sm leading-6 text-muted">
                {job.location} · {job.department} · {job.postedLabel || timeAgo(job.postedAt)}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {jobTags(job).map((tag) => (
                  <span
                    key={tag}
                    className="border border-line px-2 py-1 text-[10px] tracking-[0.12em] text-muted uppercase"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-5 flex gap-2 lg:hidden">
            <SaveButton id={job.id} />
            <a
              href={job.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 flex-1 items-center justify-center bg-wine px-4 text-xs tracking-[0.16em] text-text uppercase"
            >
              Apply
            </a>
          </div>
        </div>
        <div className="mt-4 border border-line bg-surface p-4 lg:hidden">
          <p className="text-[10px] tracking-[0.18em] text-gold uppercase">Fit {score}</p>
          <p className="mt-1 text-sm text-muted">{fitWhy(job)}</p>
        </div>
        <div className="mt-6 border border-line bg-surface p-4 sm:p-6">
          <h2 className="font-display text-2xl">Brief</h2>
          <div className="mt-4">
            <JobDescription html={job.descriptionHtml} />
          </div>
        </div>
        {similar.length > 0 ? (
          <div className="mt-10">
            <h2 className="mb-4 font-display text-2xl">Nearby</h2>
            <div className="grid gap-3">
              {similar.map((item) => (
                <JobCard key={item.id} job={item} />
              ))}
            </div>
          </div>
        ) : null}
      </article>
      <aside className="hidden h-fit space-y-4 lg:sticky lg:top-24 lg:block">
        <div className="border border-gold/30 p-5">
          <p className="text-[10px] tracking-[0.18em] text-gold uppercase">Fit</p>
          <p className="mt-2 font-display text-5xl">{score}</p>
          <p className="mt-2 text-sm text-muted">{fitWhy(job)}</p>
        </div>
        <div className="border border-line bg-surface p-5">
          <h2 className="font-display text-xl">Glance</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Row label="House" value={job.company} />
            <Row label="City" value={job.city} />
            <Row label="Team" value={job.department} />
            <Row label="Source" value={atsLabel(job.ats)} />
            {job.workplaceType ? <Row label="Type" value={job.workplaceType} /> : null}
          </dl>
          <a
            href={job.url}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex h-11 w-full items-center justify-center bg-wine text-xs tracking-[0.16em] text-text uppercase"
          >
            Apply on {job.company}
          </a>
          <div className="mt-2 flex justify-center">
            <SaveButton id={job.id} />
          </div>
          <p className="mt-5 text-xs leading-5 text-muted">Applications stay on the company’s own site.</p>
        </div>
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right text-text">{value}</dd>
    </div>
  );
}
