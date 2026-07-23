import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 20;
const VALID_TYPES = ["RENUMBERED_ONLY", "MODIFIED", "NEWLY_ADDED", "REMOVED"] as const;
type ChangeType = (typeof VALID_TYPES)[number];

export async function GET(req: NextRequest) {
  const typeParam = req.nextUrl.searchParams.get("type");
  const pageParam = req.nextUrl.searchParams.get("page");
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const type: ChangeType | null =
    typeParam && (VALID_TYPES as readonly string[]).includes(typeParam)
      ? (typeParam as ChangeType)
      : null;

  try {
    // Counts per category, computed once so the filter chips can show numbers
    const [renumbered, modified, newlyAdded, removed] = await Promise.all([
      prisma.mapping.count({ where: { changeType: "RENUMBERED_ONLY" } }),
      prisma.mapping.count({ where: { changeType: "MODIFIED" } }),
      prisma.mapping.count({ where: { changeType: "NEWLY_ADDED" } }),
      prisma.mapping.count({ where: { changeType: "REMOVED" } }),
    ]);
    const counts = {
      RENUMBERED_ONLY: renumbered,
      MODIFIED: modified,
      NEWLY_ADDED: newlyAdded,
      REMOVED: removed,
      ALL: renumbered + modified + newlyAdded + removed,
    };

    const where = type ? { changeType: type } : {};
    const total = type ? counts[type] : counts.ALL;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    const mappings = await prisma.mapping.findMany({
      where,
      include: { oldSection: true, newSection: true },
      orderBy: { createdAt: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    });

    const results = mappings.map((m) => {
      // Prefer showing the BNS section as the "primary" section when it exists
      // (since that's the current law), falling back to the IPC one for
      // REMOVED entries that have no BNS counterpart.
      const primary = m.newSection ?? m.oldSection!;
      const counterpart = m.newSection ? m.oldSection : null;
      return {
        section: stripSection(primary),
        counterpart: counterpart ? stripSection(counterpart) : null,
        changeType: m.changeType,
        summary: m.summary,
      };
    });

    return NextResponse.json({ counts, page, totalPages, results });
  } catch (err) {
    console.error("Changes browse error:", err);
    return NextResponse.json(
      { error: "Something went wrong while loading changes." },
      { status: 500 }
    );
  }
}

function stripSection(s: {
  id: string;
  codeType: string;
  sectionNumber: string;
  title: string;
  bodyText: string;
}) {
  return {
    id: s.id,
    codeType: s.codeType,
    sectionNumber: s.sectionNumber,
    title: s.title,
    bodyText: s.bodyText,
  };
}