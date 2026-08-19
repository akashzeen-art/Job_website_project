"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CITIES } from "@/lib/india";
import { parseIntent } from "@/lib/intent";
import { fitScore } from "@/lib/insights";
import type { Job } from "@/lib/types";
import { JobCard } from "@/components/JobCard";
import { SearchBar } from "@/components/SearchBar";

const PAGE_SIZE = 10;

type Props = {
  jobs: Job[];
  companies: { slug: string; name: string; count: number }[];
  departments: string[];
};

export function JobsExplorer({ jobs, companies, departments }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<"fit" | "new">("fit");

  const q = searchParams.get("q") ?? "";
  const city = searchParams.get("city") ?? "";
  const company = searchParams.get("company") ?? "";
  const department = searchParams.get("department") ?? "";
  const intent = useMemo(() => parseIntent(q), [q]);

  useEffect(() => {
    setPage(1);
  }, [q, city, company, department, sort]);

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = sheetOpen ? "hidden" : original;
    return () => {
      document.body.style.overflow = original;
    };
  }, [sheetOpen]);

  const filtered = useMemo(() => {
    const cityFilter = city || intent.city || "";
    const companyFilter = company || intent.company || "";
    const departmentFilter = department || "";
    const text = (company ? q : intent.q).trim().toLowerCase();

    const next = jobs.filter((job) => {
      if (text) {
        const haystack = `${job.title} ${job.company} ${job.location} ${job.department}`.toLowerCase();
        const tokens = text.split(/\s+/).filter(Boolean);
        if (!tokens.every((token) => haystack.includes(token))) return false;
      }
      if (cityFilter && job.city !== cityFilter) return false;
      if (companyFilter && job.companySlug !== companyFilter) return false;
      if (departmentFilter && job.department !== departmentFilter) return false;
      return true;
    });

    return next.sort((a, b) =>
      sort === "fit"
        ? fitScore(b, q) - fitScore(a, q)
        : (Date.parse(b.postedAt ?? "") || 0) - (Date.parse(a.postedAt ?? "") || 0),
    );
  }, [jobs, q, city, company, department, intent, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const understood = [intent.city, companies.find((item) => item.slug === intent.company)?.name]
    .filter(Boolean)
    .join(" · ");
  const cityOptions = CITIES.filter((item) => jobs.some((job) => job.city === item));
  const activeFilters = [city, company, department].filter(Boolean).length;

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  const filters = (
    <div className="space-y-6">
      <FilterGroup label="City">
        <FilterChip active={!city} onClick={() => setParam("city", "")} label="All India" />
        {cityOptions.map((item) => (
          <FilterChip
            key={item}
            active={city === item}
            onClick={() => setParam("city", city === item ? "" : item)}
            label={item}
          />
        ))}
      </FilterGroup>
      <FilterGroup label="Function">
        <FilterChip active={!department} onClick={() => setParam("department", "")} label="All" />
        {departments.map((item) => (
          <FilterChip
            key={item}
            active={department === item}
            onClick={() => setParam("department", department === item ? "" : item)}
            label={item}
          />
        ))}
      </FilterGroup>
      <FilterGroup label="House">
        <select
          value={company}
          onChange={(event) => setParam("company", event.target.value)}
          className="h-12 w-full max-w-full border border-line bg-bg px-3 text-sm text-text outline-none"
        >
          <option value="">All houses</option>
          {companies.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.name} ({item.count})
            </option>
          ))}
        </select>
      </FilterGroup>
    </div>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="hidden lg:block">
        <div className="sticky top-24 border border-line bg-surface p-5">{filters}</div>
      </aside>

      <div className="min-w-0">
        <SearchBar defaultQuery={q} compact jobs={jobs} />

        <div className="-mx-4 mt-4 lg:hidden">
          <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-1 snap-x">
            <FilterChip active={!city} onClick={() => setParam("city", "")} label="All India" />
            {cityOptions.map((item) => (
              <FilterChip
                key={item}
                active={city === item}
                onClick={() => setParam("city", city === item ? "" : item)}
                label={item}
              />
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <p className="min-w-0 flex-1 truncate text-sm text-muted">
            <span className="text-text">{filtered.length}</span> roles
          </p>
          <div className="flex shrink-0 items-center gap-3 text-[11px] tracking-[0.12em] uppercase">
            <button
              type="button"
              onClick={() => setSort("fit")}
              className={sort === "fit" ? "text-gold" : "text-muted"}
            >
              Fit
            </button>
            <button
              type="button"
              onClick={() => setSort("new")}
              className={sort === "new" ? "text-gold" : "text-muted"}
            >
              New
            </button>
            <button
              type="button"
              className="border border-line px-2.5 py-1.5 lg:hidden"
              onClick={() => setSheetOpen(true)}
            >
              Filter{activeFilters ? ` · ${activeFilters}` : ""}
            </button>
          </div>
        </div>

        {understood && q ? (
          <p className="mt-3 text-sm text-gold">
            {understood}
            {intent.q ? ` · ${intent.q}` : ""}
          </p>
        ) : null}

        {sheetOpen ? (
          <div className="fixed inset-0 z-[70] lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/60"
              aria-label="Close filters"
              onClick={() => setSheetOpen(false)}
            />
            <div className="absolute inset-x-0 bottom-0 flex max-h-[86vh] flex-col border-t border-line bg-bg">
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <h2 className="font-display text-2xl">Refine</h2>
                <button type="button" className="text-sm text-gold" onClick={() => setSheetOpen(false)}>
                  Done
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-5">{filters}</div>
              <div
                className="flex gap-2 border-t border-line px-4 pt-3"
                style={{ paddingBottom: "calc(0.85rem + env(safe-area-inset-bottom))" }}
              >
                <button
                  type="button"
                  className="h-11 flex-1 border border-line text-sm"
                  onClick={() => {
                    setPage(1);
                    router.replace("/jobs");
                    setSheetOpen(false);
                  }}
                >
                  Clear
                </button>
                <button
                  type="button"
                  className="h-11 flex-1 bg-wine text-sm tracking-[0.12em] uppercase"
                  onClick={() => setSheetOpen(false)}
                >
                  Show {filtered.length}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {visible.length === 0 ? (
          <p className="mt-4 border border-dashed border-line px-4 py-12 text-center text-muted">
            Nothing matched. Try “remote AI Bengaluru”.
          </p>
        ) : (
          <div className="mt-4 grid gap-3">
            {visible.map((job) => (
              <JobCard key={job.id} job={job} query={q} dense />
            ))}
          </div>
        )}

        {pages > 1 ? (
          <div className="mt-6 mb-2 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => {
                setPage((value) => Math.max(1, value - 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="h-11 border border-line text-sm disabled:opacity-40"
            >
              Prev
            </button>
            <span className="text-sm text-muted">
              {currentPage} / {pages}
            </span>
            <button
              type="button"
              disabled={currentPage === pages}
              onClick={() => {
                setPage((value) => Math.min(pages, value + 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="h-11 border border-line text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-[10px] tracking-[0.2em] text-muted uppercase">{label}</h2>
      <div className="flex flex-wrap gap-2">{children}</div>
    </section>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-9 shrink-0 snap-start px-3 text-xs ${
        active ? "bg-text text-bg" : "border border-line text-muted"
      }`}
    >
      {label}
    </button>
  );
}
