import { Link } from "react-router-dom";
import { CompanyMark } from "@/components/CompanyMark";
import { LoadingPanel } from "@/components/LoadingPanel";
import { COMPANIES } from "@/lib/companies";
import { useJobs } from "@/context/JobsContext";

export function CompaniesPage() {
  const { jobs, loading } = useJobs();
  if (loading) return <LoadingPanel />;

  const rows = COMPANIES.map((company) => ({
    ...company,
    count: jobs.filter((job) => job.companySlug === company.slug).length,
  }))
    .filter((company) => company.count > 0)
    .sort((a, b) => b.count - a.count);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <p className="text-[11px] tracking-[0.24em] text-gold uppercase">Houses</p>
      <h1 className="mt-2 font-display text-4xl leading-tight sm:text-5xl">
        International rooms, Indian desks
      </h1>
      <p className="mt-3 max-w-xl text-muted">Headquarters abroad. Openings here. Counts from the live fetch.</p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((company) => (
          <Link
            key={company.slug}
            to={`/companies/${company.slug}`}
            className="card-hover flex gap-4 border border-line bg-surface p-4 sm:p-5"
          >
            <CompanyMark name={company.name} website={company.website} size={44} />
            <div className="min-w-0">
              <h2 className="font-display text-xl leading-tight">{company.name}</h2>
              <p className="mt-1 text-sm text-muted">
                {company.industry} · {company.hq}
              </p>
              <p className="mt-2 text-sm text-gold">{company.count} roles</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
