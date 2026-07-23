"use client";

import { useState } from "react";
import Link from "next/link";

type SectionData = {
  id: string;
  codeType: "IPC" | "BNS";
  sectionNumber: string;
  title: string;
  bodyText: string;
};

type ResultRow = {
  section: SectionData;
  counterpart: SectionData | null;
  changeType: "RENUMBERED_ONLY" | "MODIFIED" | "NEWLY_ADDED" | "REMOVED";
  summary: string | null;
};

const CHANGE_LABEL: Record<string, string> = {
  RENUMBERED_ONLY: "Renumbered",
  MODIFIED: "Modified",
  NEWLY_ADDED: "New in BNS",
  REMOVED: "Repealed",
};

export function LiveSearchDemo() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<ResultRow | null | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      setResult(data.results?.[0] ?? null);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-sm border border-[#A53860]/25 bg-white p-5 shadow-[0_2px_0_#A53860]/10">
      <p
        className="mb-3 text-[10px] uppercase tracking-widest text-[#A53860]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        ● Try it right now
      </p>
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. 302, or “theft”"
          className="min-w-0 flex-1 rounded-sm border border-[#A53860]/30 bg-[#FFF8F1] px-3 py-2.5 text-[14px] outline-none placeholder:text-[#9C7280] focus:border-[#A53860] focus:ring-2 focus:ring-[#A53860]/20"
          style={{ fontFamily: "var(--font-body)" }}
        />
        <button
          type="submit"
          className="shrink-0 rounded-sm bg-[#450920] px-4 py-2.5 text-[12px] uppercase tracking-wide text-[#F9DBBD] transition hover:bg-[#5C0F2B]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {loading ? "…" : "Go"}
        </button>
      </form>

      {result === undefined && (
        <p className="mt-4 text-[12.5px] italic text-[#9C7280]">
          Results appear right here — no page reload.
        </p>
      )}

      {result === null && (
        <p className="mt-4 text-[12.5px] italic text-[#9C7280]">No match found. Try “302” or “theft.”</p>
      )}

      {result && (
        <div className="mt-4 rounded-sm border border-[#F0C4AE] bg-[#FFF8F1] p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-[13.5px] font-semibold text-[#450920]">{result.section.title}</p>
            <span
              className="shrink-0 rounded-full bg-[#A53860] px-2.5 py-0.5 text-[9px] uppercase tracking-wide text-white"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {CHANGE_LABEL[result.changeType]}
            </span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px]" style={{ fontFamily: "var(--font-mono)" }}>
            <span className="text-[#A53860]">
              IPC {result.section.codeType === "IPC" ? result.section.sectionNumber : result.counterpart?.sectionNumber ?? "—"}
            </span>
            <span className="text-[#DA627D]">
              BNS {result.section.codeType === "BNS" ? result.section.sectionNumber : result.counterpart?.sectionNumber ?? "—"}
            </span>
          </div>
          <Link
            href="/search"
            className="mt-3 inline-block text-[11px] uppercase tracking-wide text-[#A53860] underline decoration-[#F0C4AE] underline-offset-4 hover:text-[#450920]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            See full comparison →
          </Link>
        </div>
      )}
    </div>
  );
}
