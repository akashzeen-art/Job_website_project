export function encodeJobId(ats: string, slug: string, sourceId: string): string {
  const json = JSON.stringify([ats, slug, sourceId]);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function decodeJobId(id: string): { ats: string; slug: string; sourceId: string } | null {
  try {
    const padded = id.replace(/-/g, "+").replace(/_/g, "/");
    const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
    const binary = atob(padded + pad);
    const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
    const parsed = JSON.parse(new TextDecoder().decode(bytes));
    if (!Array.isArray(parsed) || parsed.length !== 3) return null;
    return { ats: parsed[0], slug: parsed[1], sourceId: parsed[2] };
  } catch {
    return null;
  }
}
