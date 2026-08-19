"use client";

export function JobDescription({ html }: { html: string }) {
  if (!html) {
    return (
      <p className="text-muted">
        Full description lives on the company’s career page. Use Apply to read it and submit there.
      </p>
    );
  }

  return (
    <div
      className="job-prose max-w-none text-[15px] leading-7"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
