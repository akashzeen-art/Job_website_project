export function encodeJobId(ats: string, slug: string, sourceId: string): string {
  return Buffer.from(JSON.stringify([ats, slug, sourceId])).toString("base64url");
}

export function decodeJobId(id: string): { ats: string; slug: string; sourceId: string } | null {
  try {
    const parsed = JSON.parse(Buffer.from(id, "base64url").toString("utf8"));
    if (!Array.isArray(parsed) || parsed.length !== 3) return null;
    return { ats: parsed[0], slug: parsed[1], sourceId: parsed[2] };
  } catch {
    return null;
  }
}
