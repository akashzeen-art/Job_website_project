import { Link, useParams } from "react-router-dom";
import { CompanyMark } from "@/components/CompanyMark";
import { JobCard } from "@/components/JobCard";
import { LoadingPanel } from "@/components/LoadingPanel";
import { COMPANY_BY_SLUG } from "@/lib/companies";
import { atsLabel } from "@/lib/format";
import { useJobs } from "@/context/JobsContext";
import { NotFoundPage } from "@/pages/NotFoundPage";

export function CompanyPage() {
  const { slug } = useParams();
  const { jobs, loading } = useJobs();
  const company = slug ? COMPANY_BY_SLUG[slug] : undefined;

  if (loading) return <LoadingPanel />;
  if (!company) return <NotFoundPage />;

  const companyJobs = jobs.filter((job) => job.companySlug === company.slug);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <Link to="/companies" className="text-sm text-muted hover:text-text">
        ← Houses
      </Link>
      <div className="mt-5 border border-line bg-surface p-4 sm:p-6">
        <div className="flex items-start gap-4">
          <CompanyMark name={company.name} website={company.website} size={52} />
          <div className="min-w-0">
            <p className="text-[11px] tracking-[0.18em] text-gold uppercase">{company.industry}</p>
            <h1 className="mt-1 font-display text-3xl leading-tight sm:text-4xl">{company.name}</h1>
            <p className="mt-1 text-sm text-muted">
              HQ {company.hq} · {atsLabel(company.ats)}
            </p>
            <a href={company.website} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm text-gold">
              Website
            </a>
          </div>
        </div>
      </div>
      <p className="mt-8 text-sm text-muted">{companyJobs.length} India openings</p>
      <div className="mt-4 grid gap-3">
        {companyJobs.length === 0 ? (
          <p className="border border-dashed border-line px-5 py-14 text-center text-muted">
            Quiet on this board for now.
          </p>
        ) : (
          companyJobs.map((job) => <JobCard key={job.id} job={job} />)
        )}
      </div>
    </div>
  );
}
