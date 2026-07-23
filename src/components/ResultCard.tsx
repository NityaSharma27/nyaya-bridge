"use client";

import { useState } from "react";
import { diffWords } from "@/lib/diff";

export type SectionData = {
  id: string;
  codeType: "IPC" | "BNS";
  sectionNumber: string;
  title: string;
  bodyText: string;
};

export type ResultRow = {
  section: SectionData;
  counterpart: SectionData | null;
  changeType: "RENUMBERED_ONLY" | "MODIFIED" | "NEWLY_ADDED" | "REMOVED";
  summary: string | null;
};

export const CHANGE_LABEL: Record<string, string> = {
  RENUMBERED_ONLY: "Renumbered",
  MODIFIED: "Modified",
  NEWLY_ADDED: "New in BNS",
  REMOVED: "Repealed",
};

export const CHANGE_COLOR: Record<string, string> = {
  RENUMBERED_ONLY: "bg-[#DA627D] text-white",
  MODIFIED: "bg-[#A53860] text-white",
  NEWLY_ADDED: "bg-[#450920] text-white",
  REMOVED: "bg-[#FFA5AB] text-[#450920]",
};

export function ResultCard({ row }: { row: ResultRow }) {
  const [expanded, setExpanded] = useState(false);
  const { section, counterpart, changeType, summary } = row;
  const isIpcPrimary = section.codeType === "IPC";
  const left = isIpcPrimary ? section : counterpart;
  const right = isIpcPrimary ? counterpart : section;

  return (
    <div className="relative overflow-hidden rounded-sm border border-[#A53860]/20 bg-white shadow-[0_1px_0_rgba(165,56,96,0.15)]">
      <div className="flex items-center justify-between border-b border-[#F0C4AE] bg-[#FFF8F1] px-5 py-3">
        <h2 className="text-lg text-[#450920]" style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
          {section.title}
        </h2>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-[10px] uppercase tracking-wide ${CHANGE_COLOR[changeType]}`}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {CHANGE_LABEL[changeType]}
        </span>
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-2">
        <ColumnHalf data={left} codeLabel="IPC 1860" accent="#A53860" />
        <div className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-[#F0C4AE] md:block">
          <div
            className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#F0C4AE] bg-[#F9DBBD] text-[13px] text-[#A53860]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ⇌
          </div>
        </div>
        <ColumnHalf data={right} codeLabel="BNS 2023" accent="#DA627D" />
      </div>

      <div className="border-t border-[#F0C4AE] px-5 py-4">
        {summary && <p className="text-[14px] leading-relaxed text-[#6B1F35]">{summary}</p>}
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[12px] uppercase tracking-wide text-[#A53860] underline decoration-[#F0C4AE] underline-offset-4 hover:text-[#450920]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {expanded ? "Hide full text" : "Read full section text"}
          </button>
          <a
            href={`/api/export-pdf?sectionId=${section.id}&codeType=${section.codeType}`}
            className="text-[12px] uppercase tracking-wide text-[#DA627D] underline decoration-[#F0C4AE] underline-offset-4 hover:text-[#450920]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Download PDF
          </a>
        </div>

        {expanded && (
          <div className="mt-4 grid grid-cols-1 gap-4 border-t border-dashed border-[#F0C4AE] pt-4 md:grid-cols-2">
            {left && right ? (
              <DiffText oldData={left} newData={right} />
            ) : (
              <>
                <FullText data={left} />
                <FullText data={right} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ColumnHalf({ data, codeLabel, accent }: { data: SectionData | null; codeLabel: string; accent: string }) {
  if (!data) {
    return (
      <div className="px-5 py-4">
        <p className="mb-1 text-[10px] uppercase tracking-widest text-[#9C7280]" style={{ fontFamily: "var(--font-mono)" }}>
          {codeLabel}
        </p>
        <p className="text-sm italic text-[#9C7280]">No corresponding section.</p>
      </div>
    );
  }
  return (
    <div className="px-5 py-4">
      <p className="mb-1 text-[10px] uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)", color: accent }}>
        {codeLabel} · Sec. {data.sectionNumber}
      </p>
      <p className="text-[14px] leading-snug text-[#450920]">{data.title}</p>
    </div>
  );
}

function FullText({ data }: { data: SectionData | null }) {
  if (!data) return <div />;
  if (!data.bodyText?.trim()) {
    return (
      <div className="max-h-72 overflow-y-auto rounded-sm bg-[#FFF8F1] p-4">
        <p className="text-[13px] italic text-[#9C7280]">
          No further section text beyond the title above — this provision was already
          omitted or repealed by an earlier amendment, prior to the BNS.
        </p>
      </div>
    );
  }
  return (
    <div className="max-h-72 overflow-y-auto rounded-sm bg-[#FFF8F1] p-4">
      <p className="whitespace-pre-line text-[13.5px] leading-relaxed text-[#3A0A18]" style={{ fontFamily: "var(--font-body)" }}>
        {data.bodyText}
      </p>
    </div>
  );
}

function DiffText({ oldData, newData }: { oldData: SectionData; newData: SectionData }) {
  const { blocks } = diffWords(oldData.bodyText, newData.bodyText);

  return (
    <>
      <div className="max-h-72 overflow-y-auto rounded-sm bg-[#FFF8F1] p-4">
        <p className="mb-2 text-[10px] uppercase tracking-widest text-[#A53860]" style={{ fontFamily: "var(--font-mono)" }}>
          IPC 1860 · as originally worded
        </p>
        <div className="space-y-1.5 text-[13.5px] leading-relaxed text-[#3A0A18]" style={{ fontFamily: "var(--font-body)" }}>
          {blocks.map((block, bi) =>
            block.oldOps.length === 0 ? null : (
              <p key={bi}>
                {block.oldOps.map((op, i) =>
                  op.type === "delete" ? (
                    <span key={i} className="bg-[#FFA5AB]/50 text-[#A53860] line-through decoration-[#A53860]/60">
                      {op.text}
                    </span>
                  ) : (
                    <span key={i}>{op.text}</span>
                  )
                )}
              </p>
            )
          )}
        </div>
      </div>
      <div className="max-h-72 overflow-y-auto rounded-sm bg-[#FFF8F1] p-4">
        <p className="mb-2 text-[10px] uppercase tracking-widest text-[#DA627D]" style={{ fontFamily: "var(--font-mono)" }}>
          BNS 2023 · as it now reads
        </p>
        <div className="space-y-1.5 text-[13.5px] leading-relaxed text-[#3A0A18]" style={{ fontFamily: "var(--font-body)" }}>
          {blocks.map((block, bi) =>
            block.newOps.length === 0 ? null : (
              <p key={bi}>
                {block.newOps.map((op, i) =>
                  op.type === "insert" ? (
                    <span key={i} className="bg-[#DA627D]/25 text-[#A53860]">
                      {op.text}
                    </span>
                  ) : (
                    <span key={i}>{op.text}</span>
                  )
                )}
              </p>
            )
          )}
        </div>
      </div>
    </>
  );
}
