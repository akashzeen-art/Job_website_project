import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-6xl flex-col items-center justify-center px-5 text-center">
      <p className="text-[11px] tracking-[0.24em] text-gold uppercase">404</p>
      <h1 className="mt-2 font-display text-4xl">This listing has left the board</h1>
      <p className="mt-3 max-w-md text-muted">Closed, or from an older refresh.</p>
      <Link
        href="/jobs"
        className="mt-6 inline-flex h-11 items-center bg-wine px-6 text-xs tracking-[0.16em] text-text uppercase"
      >
        Return to the board
      </Link>
    </div>
  );
}
