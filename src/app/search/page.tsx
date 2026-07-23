"use client";

import { useState } from "react";
import { Fraunces, Newsreader, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
import { ResultCard, ResultRow } from "@/components/ResultCard";

const fraunces = Fraunces({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-display" });
const newsreader = Newsreader({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ResultRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Search failed.");
        setResults([]);
      } else {
        setResults(data.results);
      }
    } catch {
      setError("Could not reach the server. Is it running?");
      setResults([]);
    } finally {
      setLoading(false);
    }
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
              href="/changes"
              className="text-[11px] uppercase tracking-wide text-[#450920] underline decoration-[#F0C4AE] underline-offset-4 hover:text-[#A53860]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Browse all changes →
            </Link>
          </div>
          <h1 className="text-4xl md:text-5xl text-[#450920]" style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
            NyayaBridge
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[#6B1F35]">
            Look up any section by number or offence — see instantly whether it moved,
            changed, or was repealed when the Bharatiya Nyaya Sanhita replaced the
            Indian Penal Code.
          </p>
        </div>
      </header>

      <div className="border-b border-[#A53860]/20 bg-white/60 px-6 py-6 md:px-12">
        <form onSubmit={handleSearch} className="mx-auto flex max-w-4xl gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try “302”, “103”, or “theft”"
            className="flex-1 rounded-sm border border-[#A53860]/30 bg-white px-4 py-3 text-[15px] outline-none placeholder:text-[#9C7280] focus:border-[#A53860] focus:ring-2 focus:ring-[#A53860]/25"
            style={{ fontFamily: "var(--font-body)" }}
          />
          <button
            type="submit"
            className="rounded-sm bg-[#450920] px-6 py-3 text-[13px] uppercase tracking-wide text-[#F9DBBD] transition hover:bg-[#5C0F2B] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A53860]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </form>
      </div>

      <main className="mx-auto max-w-4xl px-6 py-10 md:px-12">
        {error && (
          <p className="mb-6 text-sm text-[#A53860]" style={{ fontFamily: "var(--font-mono)" }}>
            {error}
          </p>
        )}

        {results === null && !loading && (
          <p className="text-sm italic text-[#9C7280]">
            Enter a section number (either code) or a keyword like “murder” or “cheating” to begin.
          </p>
        )}

        {results !== null && results.length === 0 && !error && (
          <p className="text-sm italic text-[#9C7280]">No matching sections found.</p>
        )}

        <div className="space-y-6">
          {results?.map((row, i) => (
            <ResultCard key={row.section.id + i} row={row} />
          ))}
        </div>
      </main>
    </div>
  );
}
