// FetchAllRepos.ts
import { useEffect, useState } from "react";

type RepoPreview = { name: string; preview: string[] };

const TARGETS = [
  "SolarSense",
  "CISpace",
  "twindigital",
  "realtor",
  "old-portfolio",
  "openmemory",
  "memorygame",
] as const;

const LOCAL_PREVIEW_ALIAS: Record<string, string> = {
  SolarSense: "SolarSensePreview",
};

function buildLocalPreviewMap(): Record<string, string[]> {
  const modules = import.meta.glob("/src/assets/**/*.{png,jpg,jpeg,webp,gif}", {
    eager: true, as: "url"
  }) as Record<string, string>;
  const map: Record<string, string[]> = {};
  const add = (k: string, url: string) => ((map[k] ??= []).push(url));

  for (const [path, url] of Object.entries(modules)) {
    const m1 = path.match(/\/assets\/previews\/([^/]+)\/[^/]+\.(png|jpe?g|webp|gif)$/i);
    if (m1) { add(m1[1], url); continue; }
    const m2 = path.match(/\/assets\/([^/]+)Preview\/[^/]+\.(png|jpe?g|webp|gif)$/i);
    if (m2) { add(m2[1], url); continue; }
    for (const [repoName, folderName] of Object.entries(LOCAL_PREVIEW_ALIAS)) {
      const rx = new RegExp(`/assets/${folderName}/[^/]+\\.(png|jpe?g|webp|gif)$`, "i");
      if (rx.test(path)) { add(repoName, url); break; }
    }
  }
  for (const k of Object.keys(map)) map[k] = map[k].sort((a, b) => a.localeCompare(b));
  return map;
}

export default function useRepoPreviewsOneCall(owner: string) {
  const [items, setItems] = useState<RepoPreview[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const localMap = buildLocalPreviewMap();
    const allLocal = TARGETS.every((n) => localMap[n]?.length);
    if (allLocal) {
      setItems(TARGETS.map((n) => ({ name: n, preview: localMap[n] })));
      return;
    }

    (async () => {
      try {
        const needsRemote = TARGETS.filter((n) => !(localMap[n]?.length));
        let remoteData: Record<string, any> = {};

        if (needsRemote.length) {
          // ⬇️ درخواست به فانکشن نتلایف (توکن سمت سرور)
          const res = await fetch("/.netlify/functions/gh-previews", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ owner, repos: needsRemote })
          });
          const json = await res.json();
          if (!res.ok) throw new Error(JSON.stringify(json, null, 2));
          remoteData = json;
        }

        const final: RepoPreview[] = [];
        TARGETS.forEach((name) => {
          if (localMap[name]?.length) {
            final.push({ name, preview: localMap[name] });
            return;
          }
          const idx = needsRemote.indexOf(name);
          if (idx >= 0) {
            const node = remoteData[`r${idx}`];
            if (node) {
              const branch = node.defaultBranchRef?.name ?? "HEAD";
              const entries = node.previewTree?.entries ?? [];
              const files = entries
                .filter((e: any) => e.type === "blob" && /\.(png|jpe?g|gif|webp)$/i.test(e.name))
                .map((e: any) => e.name)
                .sort((a: string, b: string) => a.localeCompare(b));
              const base = `https://raw.githubusercontent.com/${owner}/${node.name}/${branch}/preview`;
              final.push({ name, preview: files.map((f: string) => `${base}/${encodeURIComponent(f)}`) });
              return;
            }
          }
          final.push({ name, preview: [] });
        });

        setItems(final);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load previews");
      }
    })();
  }, [owner]);

  return { items, error };
}
