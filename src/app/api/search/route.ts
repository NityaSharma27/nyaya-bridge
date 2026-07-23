import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SECTION_NUMBER_PATTERN = /^\d{1,3}[A-Za-z]{0,2}$/;

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json(
      { error: "Missing query parameter 'q'." },
      { status: 400 }
    );
  }

  const isSectionNumberQuery = SECTION_NUMBER_PATTERN.test(q);

  try {
    if (isSectionNumberQuery) {
      const results = await searchBySectionNumber(q);
      return NextResponse.json({ mode: "section", results });
    } else {
      const results = await searchByKeyword(q);
      return NextResponse.json({ mode: "keyword", results });
    }
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json(
      { error: "Something went wrong while searching." },
      { status: 500 }
    );
  }
}

async function searchBySectionNumber(sectionNumber: string) {
  const normalized = sectionNumber.toUpperCase();

  const matchedSections = await prisma.section.findMany({
    where: { sectionNumber: normalized },
    include: {
      oldMappings: { include: { newSection: true } }, // if this section is the "old" (IPC) side
      newMappings: { include: { oldSection: true } }, // if this section is the "new" (BNS) side
    },
  });

  const results = matchedSections.map((section) => {
    if (section.codeType === "IPC") {
      const mapping = section.oldMappings[0];
      return {
        section: stripSection(section),
        counterpart: mapping?.newSection ? stripSection(mapping.newSection) : null,
        changeType: mapping?.changeType ?? "REMOVED",
        summary: mapping?.summary ?? null,
      };
    } else {
      const mapping = section.newMappings[0];
      return {
        section: stripSection(section),
        counterpart: mapping?.oldSection ? stripSection(mapping.oldSection) : null,
        changeType: mapping?.changeType ?? "NEWLY_ADDED",
        summary: mapping?.summary ?? null,
      };
    }
  });

  return results;
}

async function searchByKeyword(query: string) {
  const rows = await prisma.$queryRaw<
    {
      id: string;
      codeType: "IPC" | "BNS";
      sectionNumber: string;
      title: string;
      bodyText: string;
      rank: number;
    }[]
  >`
    SELECT id, "codeType", "sectionNumber", title, "bodyText",
           ts_rank(
             to_tsvector('english', title || ' ' || "bodyText"),
             plainto_tsquery('english', ${query})
           ) AS rank
    FROM "Section"
    WHERE to_tsvector('english', title || ' ' || "bodyText")
          @@ plainto_tsquery('english', ${query})
    ORDER BY rank DESC
    LIMIT 25;
  `;

  const rawResults = await Promise.all(
    rows.map(async (row) => {
      if (row.codeType === "IPC") {
        const mapping = await prisma.mapping.findFirst({
          where: { oldSectionId: row.id },
          include: { newSection: true },
        });
        return {
          section: row,
          counterpart: mapping?.newSection ? stripSection(mapping.newSection) : null,
          changeType: mapping?.changeType ?? "REMOVED",
          summary: mapping?.summary ?? null,
        };
      } else {
        const mapping = await prisma.mapping.findFirst({
          where: { newSectionId: row.id },
          include: { oldSection: true },
        });
        return {
          section: row,
          counterpart: mapping?.oldSection ? stripSection(mapping.oldSection) : null,
          changeType: mapping?.changeType ?? "NEWLY_ADDED",
          summary: mapping?.summary ?? null,
        };
      }
    })
  );

  const seenPairs = new Set<string>();
  const results = rawResults.filter((r) => {
    const key = r.counterpart
      ? [r.section.id, r.counterpart.id].sort().join("::")
      : r.section.id; 
    if (seenPairs.has(key)) return false;
    seenPairs.add(key);
    return true;
  });

  return results;
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