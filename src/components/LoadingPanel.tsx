export function LoadingPanel({ label = "Drawing the board" }: { label?: string }) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-6xl flex-col items-center justify-center px-5 text-center">
      <p className="text-[11px] tracking-[0.28em] text-gold uppercase">Meridian</p>
      <p className="mt-3 font-display text-3xl text-text">{label}</p>
      <p className="mt-2 max-w-md text-sm text-muted">
        Reading official career pages. The first pass is slow; then it rests for half an hour.
      </p>
      <div className="mt-8 grid w-full max-w-xl gap-3">
        <div className="h-24 shimmer" />
        <div className="h-24 shimmer" />
      </div>
    </div>
  );
}
