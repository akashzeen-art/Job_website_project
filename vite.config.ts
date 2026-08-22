import { defineConfig, type Plugin, type ViteDevServer } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

const atsProxy = {
  "/ats/gh": {
    target: "https://boards-api.greenhouse.io",
    changeOrigin: true,
    rewrite: (p: string) => p.replace(/^\/ats\/gh/, ""),
  },
  "/ats/ashby": {
    target: "https://api.ashbyhq.com",
    changeOrigin: true,
    rewrite: (p: string) => p.replace(/^\/ats\/ashby/, ""),
  },
};

function workdayProxy(): Plugin {
  function attach(server: { middlewares: ViteDevServer["middlewares"] }) {
    server.middlewares.use("/ats/wd", async (req, res) => {
        try {
          const incoming = req.url ?? "/";
          const rest = incoming.startsWith("/ats/wd")
            ? incoming.slice("/ats/wd".length)
            : incoming;
          const trimmed = rest.startsWith("/") ? rest.slice(1) : rest;
          const slash = trimmed.indexOf("/");
          if (slash < 1) {
            res.statusCode = 400;
            res.end("Missing Workday host");
            return;
          }
          const host = trimmed.slice(0, slash);
          const targetPath = trimmed.slice(slash);
          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(Buffer.from(chunk));
          const body = Buffer.concat(chunks);
          const upstream = await fetch(`https://${host}${targetPath}`, {
            method: req.method,
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              "User-Agent": "MeridianJobs/1.0",
            },
            body: req.method && req.method !== "GET" && req.method !== "HEAD" ? body : undefined,
          });
          res.statusCode = upstream.status;
          res.setHeader("Content-Type", upstream.headers.get("content-type") ?? "application/json");
          res.end(Buffer.from(await upstream.arrayBuffer()));
        } catch {
          res.statusCode = 502;
          res.end("Workday proxy failed");
        }
    });
  }
  return {
    name: "workday-proxy",
    configureServer: attach,
    configurePreviewServer: attach,
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), workdayProxy()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      ...atsProxy,
      "/api": {
        target: "https://cookstudio.live",
        changeOrigin: true,
        secure: true,
      },
    },
  },
  preview: {
    port: 4173,
    proxy: {
      ...atsProxy,
      "/api": {
        target: "https://cookstudio.live",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
