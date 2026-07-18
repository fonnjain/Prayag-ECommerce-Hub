import { useEffect, useRef, useState } from "react";

const MAX_DIM = 600;
const LIGHT_MIN = 205;
const NEUTRAL_MAX_DIFF = 20;
const MAX_LEFTOVER_RATIO = 0.06;

type KeyResult = { url: string; clean: boolean } | null;

function keyOutWhite(img: HTMLImageElement): KeyResult {
  const scale = Math.min(1, MAX_DIM / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, w, h);
  let data: ImageData;
  try {
    data = ctx.getImageData(0, 0, w, h);
  } catch {
    return null;
  }
  const px = data.data;
  const isWhite = (i: number) => {
    const o = i * 4;
    const r = px[o], g = px[o + 1], b = px[o + 2];
    const mn = Math.min(r, g, b);
    const mx = Math.max(r, g, b);
    return mn >= LIGHT_MIN && mx - mn <= NEUTRAL_MAX_DIFF;
  };
  const visited = new Uint8Array(w * h);
  const queue: number[] = [];
  for (let x = 0; x < w; x++) {
    for (const y of [0, h - 1]) {
      const i = y * w + x;
      if (!visited[i] && isWhite(i)) {
        visited[i] = 1;
        queue.push(i);
      }
    }
  }
  for (let y = 0; y < h; y++) {
    for (const x of [0, w - 1]) {
      const i = y * w + x;
      if (!visited[i] && isWhite(i)) {
        visited[i] = 1;
        queue.push(i);
      }
    }
  }
  let removed = 0;
  while (queue.length) {
    const i = queue.pop()!;
    px[i * 4 + 3] = 0;
    removed++;
    const x = i % w;
    const y = (i / w) | 0;
    if (x > 0) {
      const n = i - 1;
      if (!visited[n] && isWhite(n)) { visited[n] = 1; queue.push(n); }
    }
    if (x < w - 1) {
      const n = i + 1;
      if (!visited[n] && isWhite(n)) { visited[n] = 1; queue.push(n); }
    }
    if (y > 0) {
      const n = i - w;
      if (!visited[n] && isWhite(n)) { visited[n] = 1; queue.push(n); }
    }
    if (y < h - 1) {
      const n = i + w;
      if (!visited[n] && isWhite(n)) { visited[n] = 1; queue.push(n); }
    }
  }
  let leftoverLight = 0;
  const total = w * h;
  for (let i = 0; i < total; i++) {
    if (!visited[i] && isWhite(i)) leftoverLight++;
  }
  let boundary = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      if (px[i * 4 + 3] === 0) {
        if (
          px[(i - 1) * 4 + 3] !== 0 ||
          px[(i + 1) * 4 + 3] !== 0 ||
          px[(i - w) * 4 + 3] !== 0 ||
          px[(i + w) * 4 + 3] !== 0
        ) boundary++;
      }
    }
  }
  const raggedness = removed > 0 ? boundary / Math.sqrt(removed) : Infinity;
  const clean =
    leftoverLight / total <= MAX_LEFTOVER_RATIO &&
    removed / total >= 0.15 &&
    raggedness <= 14;
  if (!clean) return { url: "", clean: false };
  ctx.putImageData(data, 0, 0);
  return { url: canvas.toDataURL("image/png"), clean: true };
}

type CacheEntry = { url: string; clean: boolean };
const cache = new Map<string, CacheEntry>();

export function ProductOnBlack({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [entry, setEntry] = useState<CacheEntry | null>(() => cache.get(src) ?? null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    if (cache.has(src)) {
      setEntry(cache.get(src)!);
      return;
    }
    setEntry(null);
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      const result = keyOutWhite(img);
      const e: CacheEntry =
        result && result.clean ? { url: result.url, clean: true } : { url: src, clean: false };
      cache.set(src, e);
      if (mounted.current) setEntry(e);
    };
    img.onerror = () => {
      const e: CacheEntry = { url: src, clean: false };
      cache.set(src, e);
      if (mounted.current) setEntry(e);
    };
    img.src = src;
    return () => {
      mounted.current = false;
    };
  }, [src]);

  if (!entry) return <div className={className} />;
  if (entry.clean) {
    return <img src={entry.url} alt={alt} loading="lazy" className={className} />;
  }
  return (
    <div className="absolute inset-2 bg-white flex items-center justify-center p-3">
      <img src={entry.url} alt={alt} loading="lazy" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 ease-out" />
    </div>
  );
}
