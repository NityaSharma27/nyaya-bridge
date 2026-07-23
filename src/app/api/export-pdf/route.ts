import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { ComparisonDocument } from "@/lib/pdf/ComparisonDocument";
import React from "react";

const CHANGE_LABEL: Record<string, string> = {
  RENUMBERED_ONLY: "Renumbered",
  MODIFIED: "Modified",
  NEWLY_ADDED: "New in BNS",
  REMOVED: "Repealed",
};

export async function GET(req: NextRequest) {
  const sectionId = req.nextUrl.searchParams.get("sectionId");
  const codeType = req.nextUrl.searchParams.get("codeType");

  if (!sectionId || (codeType !== "IPC" && codeType !== "BNS")) {
    return NextResponse.json(
      { error: "Missing or invalid 'sectionId' / 'codeType' parameters." },
      { status: 400 }
    );
  }

  try {
    const mapping =
      codeType === "IPC"
        ? await prisma.mapping.findFirst({
            where: { oldSectionId: sectionId },
            include: { oldSection: true, newSection: true },
          })
        : await prisma.mapping.findFirst({
            where: { newSectionId: sectionId },
            include: { oldSection: true, newSection: true },
          });

    if (!mapping) {
      return NextResponse.json({ error: "No mapping found for this section." }, { status: 404 });
    }

    const primaryTitle = (mapping.newSection ?? mapping.oldSection)?.title ?? "Untitled Section";

    const buffer = await renderToBuffer(
  React.createElement(ComparisonDocument, {
    primaryTitle,
    changeTypeLabel: CHANGE_LABEL[mapping.changeType] ?? mapping.changeType,
    summary: mapping.summary,
    ipc: mapping.oldSection
      ? {
          codeType: "IPC",
          sectionNumber: mapping.oldSection.sectionNumber,
          title: mapping.oldSection.title,
          bodyText: mapping.oldSection.bodyText,
        }
      : null,
    bns: mapping.newSection
      ? {
          codeType: "BNS",
          sectionNumber: mapping.newSection.sectionNumber,
          title: mapping.newSection.title,
          bodyText: mapping.newSection.bodyText,
        }
      : null,
  }) as React.ReactElement<any>
);

    const filename = `nyayabridge-${(mapping.newSection ?? mapping.oldSection)?.sectionNumber ?? "section"}.pdf`;

    return new NextResponse(new Uint8Array(buffer), {
  status: 200,
  headers: {
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${filename}"`,
  },
});
  } catch (err) {
    console.error("PDF export error:", err);
    return NextResponse.json({ error: "Could not generate PDF." }, { status: 500 });
  }
}
