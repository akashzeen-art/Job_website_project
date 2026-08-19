import { faviconUrl } from "@/lib/companies";

type Props = {
  name: string;
  website: string;
  size?: number;
};

export function CompanyMark({ name, website, size = 40 }: Props) {
  const initial = name.charAt(0).toUpperCase();
  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center overflow-hidden border border-line bg-surface-2"
      style={{ width: size, height: size }}
    >
      <span className="font-display text-sm text-gold">{initial}</span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={faviconUrl(website)}
        alt=""
        width={size}
        height={size}
        className="absolute inset-0 h-full w-full object-contain p-1.5"
      />
    </span>
  );
}
