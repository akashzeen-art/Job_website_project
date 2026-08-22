import { useNavigate } from "react-router-dom";
import { COMPANY_BY_SLUG } from "@/lib/companies";
import { timeAgo } from "@/lib/format";
import { fitScore, jobTags } from "@/lib/insights";
import type { Job } from "@/lib/types";
import { CompanyMark } from "@/components/CompanyMark";
import { SaveButton } from "@/components/SaveButton";
import { useSubscription } from "@/context/SubscriptionContext";

type Props = {
  job: Job;
  query?: string;
  dense?: boolean;
};

export function JobCard({ job, query = "", dense = false }: Props) {
  const navigate = useNavigate();
  const { checkAccess } = useSubscription();
  const company = COMPANY_BY_SLUG[job.companySlug];
  const score = fitScore(job, query);
  const tags = jobTags(job);

  async function openJobDetail(event: React.MouseEvent) {
    event.preventDefault();
    const allowed = await checkAccess({ type: "navigate", to: `/jobs/${job.id}` });
    if (allowed) navigate(`/jobs/${job.id}`);
  }

  async function openApply(event: React.MouseEvent) {
    event.preventDefault();
    const allowed = await checkAccess({ type: "external", url: job.url });
    if (allowed) window.open(job.url, "_blank", "noopener,noreferrer");
  }

  return (
    <article className={`card-hover border border-line bg-surface ${dense ? "p-3.5" : "p-4 sm:p-5"}`}>
      <div className="flex items-start gap-3">
        <CompanyMark
          name={job.company}
          website={company?.website ?? "https://example.com"}
          size={dense ? 36 : 40}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] tracking-[0.12em] text-muted uppercase">
                {job.company}
                <span className="text-line"> · </span>
                {job.city}
              </p>
              <button type="button" onClick={openJobDetail} className="mt-1 block w-full text-left">
                <h3
                  className={`break-words font-display leading-snug text-text ${
                    dense ? "text-[1.2rem]" : "text-[1.35rem] sm:text-[1.5rem]"
                  }`}
                >
                  {job.title}
                </h3>
              </button>
            </div>
            <span className="shrink-0 pt-0.5 text-xs text-gold">{score}</span>
          </div>
          <p className="mt-1.5 truncate text-sm text-muted">
            {job.department}
            <span className="mx-1.5 text-line">·</span>
            {job.postedLabel || timeAgo(job.postedAt)}
          </p>
          {!dense ? (
            <div className="mt-3 hidden flex-wrap gap-1.5 sm:flex">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="border border-line px-2 py-1 text-[10px] tracking-[0.12em] text-muted uppercase"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
          <div className={`flex gap-2 ${dense ? "mt-3" : "mt-4"}`}>
            <SaveButton id={job.id} />
            <button
              type="button"
              onClick={openApply}
              className="inline-flex h-11 flex-1 items-center justify-center bg-wine px-4 text-xs tracking-[0.16em] text-text uppercase sm:flex-none"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function JobRow(props: Props) {
  return <JobCard {...props} />;
}
