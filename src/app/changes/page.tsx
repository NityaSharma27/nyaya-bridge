"use client";

import { useEffect, useState } from "react";
import { Fraunces, Newsreader, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
import { ResultCard, ResultRow, CHANGE_LABEL } from "@/components/ResultCard";

const fraunces = Fraunces({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-display" });
const newsreader = Newsreader({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });

const FILTERS = ["ALL", "RENUMBERED_ONLY", "MODIFIED", "NEWLY_ADDED", "REMOVED"] as const;
type Filter = (typeof FILTERS)[number];
type Counts = Record<Filter, number>;

export default function ChangesPage() {
  const [filter, setFilter] = useState<Filter>("ALL");
  const [page, setPage] = useState(1);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const typeQuery = filter === "ALL" ? "" : `&type=${filter}`;
    fetch(`/api/changes?page=${page}${typeQuery}`)
      .then((res) => res.json())
      .then((data) => {
        setCounts(data.counts);
        setTotalPages(data.totalPages);
        setResults(data.results);
      })
      .finally(() => setLoading(false));
  }, [filter, page]);

  function handleFilterChange(f: Filter) {
    setFilter(f);
    setPage(1);
  }

  return (
    <div
      className={`${fraunces.variable} ${newsreader.variable} ${mono.variable} min-h-screen bg-[#F9DBBD] text-[#450920]`}
      style={{ fontFamily: "var(--font-body)" }}
    >
      <header className="border-b border-[#A53860]/20 px-6 py-10 md:px-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 flex items-center justify-between">
            <Link
              href="/"
              className="text-[11px] uppercase tracking-[0.2em] text-[#A53860] hover:text-[#450920]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ← NyayaBridge
            </Link>
            <Link
              href="/search"
              className="text-[11px] uppercase tracking-wide text-[#450920] underline decoration-[#F0C4AE] underline-offset-4 hover:text-[#A53860]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Go to search →
            </Link>
          </div>
          <h1 className="text-4xl md:text-5xl text-[#450920]" style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
            What changed
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[#6B1F35]">
            Every section of the IPC, categorised by what happened to it when the
            Bharatiya Nyaya Sanhita took effect.
          </p>
        </div>
      </header>

      <div className="border-b border-[#A53860]/20 bg-white/60 px-6 py-6 md:px-12">
        <div className="mx-auto flex max-w-4xl flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => handleFilterChange(f)}
              className={`rounded-full border px-4 py-2 text-[11px] uppercase tracking-wide transition ${
                filter === f
                  ? "border-[#450920] bg-[#450920] text-[#F9DBBD]"
                  : "border-[#A53860]/30 bg-white text-[#6B1F35] hover:border-[#A53860]"
              }`}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {f === "ALL" ? "All" : CHANGE_LABEL[f]}
              {counts && <span className="ml-1.5 opacity-60">{f === "ALL" ? counts.ALL : counts[f]}</span>}
            </button>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-6 py-10 md:px-12">
        {loading && <p className="text-sm italic text-[#9C7280]">Loading…</p>}

        {!loading && results.length === 0 && (
          <p className="text-sm italic text-[#9C7280]">No entries in this category.</p>
        )}

        <div className="space-y-6">
          {results.map((row, i) => (
            <ResultCard key={row.section.id + i} row={row} />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-sm border border-[#A53860]/30 bg-white px-4 py-2 text-[12px] uppercase tracking-wide text-[#6B1F35] disabled:opacity-40"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ← Prev
            </button>
            <span className="text-[12px] text-[#9C7280]" style={{ fontFamily: "var(--font-mono)" }}>
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-sm border border-[#A53860]/30 bg-white px-4 py-2 text-[12px] uppercase tracking-wide text-[#6B1F35] disabled:opacity-40"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Next →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
