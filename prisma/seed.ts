import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import fs from "fs";
import path from "path";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type SectionInput = {
  codeType: "IPC" | "BNS";
  sectionNumber: string;
  title: string;
  bodyText: string;
};

type MappingInput = {
  bnsSection: string | null;
  ipcSection: string | null;
  changeType: "RENUMBERED_ONLY" | "MODIFIED" | "NEWLY_ADDED" | "REMOVED";
  summary: string;
};

async function main() {
  const sectionsPath = path.join(__dirname, "final_sections.json");
  const mappingsPath = path.join(__dirname, "final_mappings.json");

  const sections: SectionInput[] = JSON.parse(
    fs.readFileSync(sectionsPath, "utf-8")
  );
  const mappings: MappingInput[] = JSON.parse(
    fs.readFileSync(mappingsPath, "utf-8")
  );

  console.log(`Loaded ${sections.length} sections, ${mappings.length} mappings from JSON.`);

  // --- Step 1: Insert all Sections, keep a lookup map of (codeType, sectionNumber) -> id ---
  console.log("Inserting sections...");
  const sectionIdMap = new Map<string, string>();

  // Batch insert in chunks to avoid overwhelming the connection
  const BATCH_SIZE = 50;
  for (let i = 0; i < sections.length; i += BATCH_SIZE) {
    const batch = sections.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (s) => {
        const created = await prisma.section.upsert({
          where: {
            codeType_sectionNumber: {
              codeType: s.codeType,
              sectionNumber: s.sectionNumber,
            },
          },
          update: {
            title: s.title,
            bodyText: s.bodyText,
          },
          create: {
            codeType: s.codeType,
            sectionNumber: s.sectionNumber,
            title: s.title,
            bodyText: s.bodyText,
          },
        });
        sectionIdMap.set(`${s.codeType}:${s.sectionNumber}`, created.id);
      })
    );
    console.log(`  ...${Math.min(i + BATCH_SIZE, sections.length)}/${sections.length} sections done`);
  }

  // --- Step 2: Insert all Mappings, linking to Section ids where they exist ---
  console.log("Inserting mappings...");
  let inserted = 0;
  let skippedNoSection = 0;

  for (let i = 0; i < mappings.length; i += BATCH_SIZE) {
    const batch = mappings.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (m) => {
        const oldSectionId = m.ipcSection
          ? sectionIdMap.get(`IPC:${m.ipcSection}`)
          : undefined;
        const newSectionId = m.bnsSection
          ? sectionIdMap.get(`BNS:${m.bnsSection}`)
          : undefined;

        // If a section number was referenced but not found in our parsed section list,
        // skip linking it (still insert the mapping with a null reference) rather than fail.
        if (m.ipcSection && !oldSectionId) skippedNoSection++;
        if (m.bnsSection && !newSectionId) skippedNoSection++;

        await prisma.mapping.create({
          data: {
            oldSectionId: oldSectionId ?? null,
            newSectionId: newSectionId ?? null,
            changeType: m.changeType,
            summary: m.summary,
          },
        });
        inserted++;
      })
    );
    console.log(`  ...${Math.min(i + BATCH_SIZE, mappings.length)}/${mappings.length} mappings done`);
  }

  console.log(`\nDone. Inserted ${inserted} mappings. (${skippedNoSection} section references were not found and left null.)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
