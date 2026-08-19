const WORKDAY_HOST = /^[a-z0-9.-]+\.myworkdayjobs\.com$/i;

export default async function handler(req, res) {
  const segments = Array.isArray(req.query.path)
    ? req.query.path
    : req.query.path
      ? [req.query.path]
      : [];
  const host = segments[0] ?? "";
  const rest = segments.slice(1).join("/");

  if (!WORKDAY_HOST.test(host) || !rest.startsWith("wday/cxs/")) {
    res.status(400).send("Invalid Workday path");
    return;
  }

  let body;
  if (Buffer.isBuffer(req.body)) {
    body = req.body;
  } else if (typeof req.body === "string") {
    body = req.body;
  } else if (req.body && typeof req.body === "object") {
    body = JSON.stringify(req.body);
  } else {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    body = Buffer.concat(chunks);
  }

  try {
    const upstream = await fetch(`https://${host}/${rest}`, {
      method: req.method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": "MeridianJobs/1.0",
      },
      body: req.method !== "GET" && req.method !== "HEAD" && body.length ? body : undefined,
    });
    const payload = Buffer.from(await upstream.arrayBuffer());
    res.status(upstream.status);
    res.setHeader("Content-Type", upstream.headers.get("content-type") ?? "application/json");
    res.setHeader("Cache-Control", "no-store");
    res.send(payload);
  } catch {
    res.status(502).send("Workday proxy failed");
  }
}
