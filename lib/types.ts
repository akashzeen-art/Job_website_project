export type Ats = "greenhouse" | "ashby" | "workday";

export type Company = {
  slug: string;
  name: string;
  ats: Ats;
  website: string;
  hq: string;
  industry: string;
  token?: string;
  workday?: {
    host: string;
    tenant: string;
    site: string;
  };
};

export type Job = {
  id: string;
  sourceId: string;
  ats: Ats;
  company: string;
  companySlug: string;
  title: string;
  location: string;
  city: string;
  department: string;
  url: string;
  postedAt: string | null;
  postedLabel: string | null;
  workplaceType: string | null;
};

export type JobDetail = Job & {
  descriptionHtml: string;
};
