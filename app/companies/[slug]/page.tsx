import Link from "next/link";
import { notFound } from "next/navigation";
import { CompanyMark } from "@/components/CompanyMark";
import { JobCard } from "@/components/JobCard";
import { COMPANY_BY_SLUG } from "@/lib/companies";
import { atsLabel } from "@/lib/format";
import { getJobs } from "@/lib/jobs";

export default async function CompanyPage({ params }: PageProps<"/companies/[slug]">) {
  const { slug } = await params;
  const company = COMPANY_BY_SLUG[slug];
  if (!company) notFound();
  const jobs = (await getJobs()).filter((job) => job.companySlug === slug);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <Link href="/companies" className="text-sm text-muted hover:text-text">
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
            <a
              href={company.website}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-sm text-gold"
            >
              Website
            </a>
          </div>
        </div>
      </div>
      <p className="mt-8 text-sm text-muted">{jobs.length} India openings</p>
      <div className="mt-4 grid gap-3">
        {jobs.length === 0 ? (
          <p className="border border-dashed border-line px-5 py-14 text-center text-muted">
            Quiet on this board for now.
          </p>
        ) : (
          jobs.map((job) => <JobCard key={job.id} job={job} />)
        )}
      </div>
    </div>
  );
}
