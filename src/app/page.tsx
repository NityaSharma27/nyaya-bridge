import { Fraunces, Newsreader, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ScalesIllustration } from "@/components/ScalesIllustration";
import { LiveSearchDemo } from "@/components/LiveSearchDemo";

const fraunces = Fraunces({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-display" });
const newsreader = Newsreader({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });

export default async function LandingPage() {
  const [sectionCount, mappingCount, repealedCount, newCount] = await Promise.all([
    prisma.section.count(),
    prisma.mapping.count(),
    prisma.mapping.count({ where: { changeType: "REMOVED" } }),
    prisma.mapping.count({ where: { changeType: "NEWLY_ADDED" } }),
  ]);

  return (
    <div
      className={`${fraunces.variable} ${newsreader.variable} ${mono.variable} relative min-h-screen overflow-x-hidden text-[#450920]`}
      style={{
        fontFamily: "var(--font-body)",
        backgroundColor: "#F9DBBD",
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(69,9,32,0.045) 1px, transparent 0)`,
        backgroundSize: "22px 22px",
      }}
    >
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes drift { from { transform: translate(0,0) rotate(0deg); } to { transform: translate(-40px,30px) rotate(8deg); } }
        @keyframes drift2 { from { transform: translate(0,0) rotate(0deg); } to { transform: translate(30px,-40px) rotate(-6deg); } }
        @keyframes sway { 0% { transform: rotate(-4deg); } 50% { transform: rotate(4deg); } 100% { transform: rotate(-4deg); } }
        @keyframes glowPulse { 0%,100% { box-shadow: 0 0 0 rgba(165,56,96,0); } 50% { box-shadow: 0 0 24px rgba(165,56,96,0.15); } }
        .fade-up { animation: fadeUp 0.7s ease-out both; }
        .fade-up-1 { animation-delay: 0.05s; } .fade-up-2 { animation-delay: 0.15s; }
        .fade-up-3 { animation-delay: 0.25s; } .fade-up-4 { animation-delay: 0.35s; }
        .drift-slow { animation: drift 14s ease-in-out infinite alternate; }
        .drift-slow-2 { animation: drift2 16s ease-in-out infinite alternate; }
        .scales-beam { animation: sway 5s ease-in-out infinite; }
        .glow-hover:hover { animation: glowPulse 1.6s ease-in-out infinite; }
        .side-rail { writing-mode: vertical-rl; text-orientation: mixed; letter-spacing: 0.3em; }
        .ornament::before, .ornament::after { content: ""; flex: 1; height: 1px; background: linear-gradient(to right, transparent, #DA627D, transparent); }
      `}</style>

      <div
        aria-hidden
        className="side-rail pointer-events-none fixed left-4 top-1/2 hidden -translate-y-1/2 select-none text-[10px] uppercase text-[#A53860]/30 xl:block"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Indian Penal Code · 1860
      </div>
      <div
        aria-hidden
        className="side-rail pointer-events-none fixed right-4 top-1/2 hidden -translate-y-1/2 select-none text-[10px] uppercase text-[#DA627D]/40 xl:block"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Bharatiya Nyaya Sanhita · 2023
      </div>
      <div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 hidden h-full w-10 border-r border-dashed border-[#A53860]/15 xl:block"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed right-0 top-0 hidden h-full w-10 border-l border-dashed border-[#DA627D]/15 xl:block"
      />

      {/* Hero -- two column: pitch + live demo */}
      <header className="relative overflow-hidden border-b border-[#A53860]/20 px-6 py-16 md:px-16 md:py-24 xl:px-24">
        <div
          aria-hidden
          className="drift-slow pointer-events-none absolute -left-10 top-8 select-none text-[180px] leading-none text-[#A53860]/[0.07] md:text-[240px]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          §
        </div>
        <div
          aria-hidden
          className="drift-slow-2 pointer-events-none absolute -right-6 bottom-0 select-none text-[140px] leading-none text-[#DA627D]/[0.09] md:text-[200px]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          ⇌
        </div>

        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p
              className="fade-up fade-up-1 mb-4 text-[11px] uppercase tracking-[0.25em] text-[#A53860]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              A working cross-reference, not a brochure
            </p>
            <h1
              className="fade-up fade-up-1 text-5xl md:text-6xl"
              style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
            >
              NyayaBridge
            </h1>
            <p className="fade-up fade-up-2 mt-5 max-w-lg text-[16px] leading-relaxed text-[#6B1F35]">
              On 1 July 2024, the Indian Penal Code was replaced by the Bharatiya Nyaya
              Sanhita — every section renumbered, many rewritten, some struck from the
              books entirely. Courts will work with both codes side by side for years.
              Search either one below and watch it resolve instantly.
            </p>
            <div className="fade-up fade-up-3 mt-7 flex flex-wrap items-center gap-4">
              <Link
                href="/search"
                className="glow-hover rounded-sm bg-[#450920] px-7 py-3 text-[13px] uppercase tracking-wide text-[#F9DBBD] transition hover:-translate-y-0.5 hover:bg-[#5C0F2B]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Open full search →
              </Link>
              <Link
                href="/changes"
                className="rounded-sm border border-[#A53860]/40 bg-white/60 px-7 py-3 text-[13px] uppercase tracking-wide text-[#6B1F35] transition hover:-translate-y-0.5 hover:border-[#A53860] hover:text-[#450920]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Browse everything changed
              </Link>
            </div>
          </div>

          <div className="fade-up fade-up-3">
            <LiveSearchDemo />
          </div>
        </div>

        <div className="fade-up fade-up-4 relative mt-4">
          <ScalesIllustration />
        </div>
      </header>

      {/* Live stats */}
      <section className="border-b border-[#A53860]/20 bg-white/60 px-6 py-10 md:px-16 xl:px-24">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 text-center md:grid-cols-4">
          <Stat value={sectionCount} label="Sections indexed" delay="fade-up-1" />
          <Stat value={mappingCount} label="Mappings tracked" delay="fade-up-2" />
          <Stat value={newCount} label="Wholly new offences" delay="fade-up-3" />
          <Stat value={repealedCount} label="Provisions repealed" delay="fade-up-4" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 md:px-16 xl:px-24">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div className="fade-up fade-up-1">
            <p
              className="mb-2 text-[10px] uppercase tracking-widest text-[#A53860]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              See it in action
            </p>
            <h2
              className="text-2xl md:text-3xl"
              style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
            >
              The most famous section in Indian law, renumbered
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-[#6B1F35]">
              The core offence is unchanged — but BNS 103 adds a clause absent from
              the IPC entirely: murder by a group of five or more, motivated by race,
              caste, sex, or similar grounds, now carries the same punishment for
              every member of the group.
            </p>
          </div>

          <div className="fade-up fade-up-2 glow-hover overflow-hidden rounded-sm border border-[#A53860]/20 bg-white shadow-[0_2px_0_rgba(165,56,96,0.1)] transition">
            <div className="flex items-center justify-between border-b border-[#F0C4AE] bg-[#FFF8F1] px-5 py-3">
              <h3 className="text-lg" style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
                Punishment for murder
              </h3>
              <span
                className="shrink-0 rounded-full bg-[#DA627D] px-3 py-1 text-[10px] uppercase tracking-wide text-white"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Renumbered
              </span>
            </div>
            <div className="relative grid grid-cols-1 md:grid-cols-2">
              <div className="px-5 py-4">
                <p className="mb-1 text-[10px] uppercase tracking-widest text-[#A53860]" style={{ fontFamily: "var(--font-mono)" }}>
                  IPC 1860 · Sec. 302
                </p>
                <p className="text-[14px] leading-snug">
                  Whoever commits murder shall be punished with death, or imprisonment
                  for life, and shall also be liable to fine.
                </p>
              </div>
              <div className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-[#F0C4AE] md:block">
                <div
                  className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#F0C4AE] bg-[#F9DBBD] text-[13px] text-[#A53860]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  ⇌
                </div>
              </div>
              <div className="px-5 py-4">
                <p className="mb-1 text-[10px] uppercase tracking-widest text-[#DA627D]" style={{ fontFamily: "var(--font-mono)" }}>
                  BNS 2023 · Sec. 103
                </p>
                <p className="text-[14px] leading-snug">
                  Whoever commits murder shall be punished with death or imprisonment
                  for life... plus a new clause on hate-motivated group killings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-xs items-center gap-3 px-6">
        <div className="ornament flex flex-1 items-center gap-3">
          <span className="text-[11px] text-[#A53860]" style={{ fontFamily: "var(--font-mono)" }}>§</span>
        </div>
      </div>

      {/* How it works */}
      <section className="border-y border-[#A53860]/20 bg-white/60 px-6 py-16 md:px-16 xl:px-24">
        <div className="mx-auto max-w-6xl">
          <h2
            className="fade-up fade-up-1 mb-12 text-center text-2xl md:text-3xl"
            style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
          >
            How NyayaBridge works
          </h2>
          <div className="relative grid grid-cols-1 gap-10 md:grid-cols-3">
            <div className="pointer-events-none absolute left-0 right-0 top-6 hidden h-px bg-[#F0C4AE] md:block" />
            <Step n="01" title="Search" body="Type a section number from either code, or a plain keyword like 'cheating' or 'kidnapping'." delay="fade-up-1" />
            <Step n="02" title="Compare" body="See the original and current wording side by side, with the exact words that changed highlighted." delay="fade-up-2" />
            <Step n="03" title="Understand" body="Read a plain-English summary of what changed and why, sourced from the official BPRD correspondence table." delay="fade-up-3" />
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="mx-auto max-w-6xl px-6 py-16 md:px-16 xl:px-24">
        <h2
          className="fade-up fade-up-1 mb-10 text-center text-2xl md:text-3xl"
          style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
        >
          The transition, in brief
        </h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <TimelineItem date="25 Dec 2023" title="Presidential assent" body="The BNS, along with the BNSS and the BSA, receives presidential assent." delay="fade-up-1" />
          <TimelineItem date="1 Jul 2024" title="Commencement" body="All three new codes come into force, replacing the IPC, CrPC, and the Evidence Act." delay="fade-up-2" />
          <TimelineItem date="Ongoing" title="Dual system in practice" body="Offences before 1 July 2024 are still tried under the old codes — both systems remain in active use." delay="fade-up-3" />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#A53860]/20 bg-white/60 px-6 py-10 md:px-16 xl:px-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-center">
            <Link href="/search" className="text-[12px] uppercase tracking-wide text-[#6B1F35] hover:text-[#450920]" style={{ fontFamily: "var(--font-mono)" }}>
              Search
            </Link>
            <Link href="/changes" className="text-[12px] uppercase tracking-wide text-[#6B1F35] hover:text-[#450920]" style={{ fontFamily: "var(--font-mono)" }}>
              Browse changes
            </Link>
          </div>
          <p className="mx-auto max-w-2xl text-center text-[12px] leading-relaxed text-[#9C7280]">
            Data compiled from the Bureau of Police Research &amp; Development (BPRD)
            correspondence tables and official bare acts published on India Code. For
            informational and reference purposes only — this is not legal advice.
            Verify with official sources or a legal professional before relying on this
            for any legal proceeding.
          </p>
        </div>
      </footer>
    </div>
  );
}

function Stat({ value, label, delay }: { value: number; label: string; delay: string }) {
  return (
    <div className={`fade-up ${delay}`}>
      <p className="text-3xl" style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
        {value.toLocaleString()}
      </p>
      <p className="mt-1 text-[10.5px] uppercase tracking-wide text-[#9C7280]" style={{ fontFamily: "var(--font-mono)" }}>
        {label}
      </p>
    </div>
  );
}

function Step({ n, title, body, delay }: { n: string; title: string; body: string; delay: string }) {
  return (
    <div className={`fade-up ${delay} relative text-center`}>
      <div
        className="relative z-10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[#F0C4AE] bg-[#F9DBBD] text-[13px] text-[#A53860]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {n}
      </div>
      <h3 className="mb-2 text-[16px]" style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
        {title}
      </h3>
      <p className="mx-auto max-w-xs text-[13.5px] leading-relaxed text-[#6B1F35]">{body}</p>
    </div>
  );
}

function TimelineItem({ date, title, body, delay }: { date: string; title: string; body: string; delay: string }) {
  return (
    <div className={`fade-up ${delay} glow-hover rounded-sm border border-[#A53860]/20 bg-white p-5 transition`}>
      <p className="mb-2 text-[12px] uppercase tracking-wide text-[#A53860]" style={{ fontFamily: "var(--font-mono)" }}>
        {date}
      </p>
      <h3 className="mb-1 text-[15px]" style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
        {title}
      </h3>
      <p className="text-[13.5px] leading-relaxed text-[#6B1F35]">{body}</p>
    </div>
  );
}
