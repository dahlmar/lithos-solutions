import Link from "next/link";
import type { MarketingContent } from "@/features/marketing/content";
import MarketingHeader from "./MarketingHeader";

/** Shared public-page template (prototype: Creative / Infrastructure). */
export default function MarketingPage({ content }: { content: MarketingContent }) {
  return (
    <div className="bg-surface text-foreground">
      <MarketingHeader />

      <main className="mx-auto max-w-[1080px] px-6 md:px-12">
        {/* Hero */}
        <section className="animate-lithos-fade border-b border-white/6 py-20 md:pb-[90px] md:pt-[130px]">
          <div className="font-mono text-[11px] tracking-[0.32em] text-accent">
            {content.eyebrow}
          </div>
          <h1 className="mt-6 max-w-[780px] text-balance text-4xl font-medium leading-[1.08] tracking-[-0.025em] md:text-[58px]">
            {content.heroTitle}
          </h1>
          <p className="mt-6 max-w-[580px] text-lg font-light leading-relaxed text-muted">
            {content.heroSub}
          </p>
        </section>

        {/* Services */}
        <section className="border-b border-white/6 py-16 md:py-[84px]">
          <div className="mb-10 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-[28px] font-medium tracking-[-0.01em]">Services</h2>
            <span className="font-mono text-[11px] tracking-[0.2em] text-muted">
              {content.services.length} DISCIPLINES
            </span>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(238px,1fr))] gap-px overflow-hidden rounded-2xl border border-white/6 bg-white/6">
            {content.services.map((svc) => (
              <div
                key={svc.no}
                className="min-h-[134px] bg-[#131313] px-6 py-[26px] transition-colors hover:bg-[#181818]"
              >
                <div className="font-mono text-[11px] text-accent">{svc.no}</div>
                <div className="mt-[18px] text-base font-medium">{svc.name}</div>
                <div className="mt-[7px] text-[12.5px] leading-normal text-muted">
                  {svc.desc}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Process */}
        <section className="border-b border-white/6 py-16 md:py-[84px]">
          <h2 className="mb-11 text-[28px] font-medium tracking-[-0.01em]">Process</h2>
          <div className="flex flex-wrap items-stretch gap-3.5">
            {content.process.map((step) => (
              <div
                key={step.n}
                className="min-w-[148px] flex-1 rounded-[14px] border border-white/7 bg-white/2 px-[22px] py-6"
              >
                <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-accent/50 font-mono text-xs text-accent">
                  {step.n}
                </div>
                <div className="mt-5 text-[15px] font-medium">{step.name}</div>
                <div className="mt-1.5 text-xs leading-snug text-muted">
                  {step.note}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Philosophy */}
        <section className="border-b border-white/6 py-20 md:py-24">
          <div className="font-mono text-[11px] tracking-[0.32em] text-muted">
            PHILOSOPHY
          </div>
          <p className="mt-7 max-w-[820px] text-pretty text-2xl font-light leading-[1.42] tracking-[-0.015em] md:text-[30px]">
            {content.philosophy}
          </p>
        </section>

        {/* Login CTA */}
        <section className="py-20 md:pb-[130px] md:pt-24">
          <div className="flex flex-wrap items-center justify-between gap-10 rounded-[20px] border border-white/8 bg-white/3 p-8 backdrop-blur-md md:p-14">
            <div>
              <div className="font-mono text-[11px] tracking-[0.3em] text-accent">
                CLIENT LOGIN
              </div>
              <h3 className="mt-[18px] text-[30px] font-medium tracking-[-0.015em]">
                Already working with us?
              </h3>
              <p className="mt-2.5 text-[15px] text-muted">
                Access your project dashboard.
              </p>
            </div>
            <Link
              href="/login"
              className="rounded-xl bg-accent px-[30px] py-[15px] text-[15px] font-medium text-[#06120d] transition-all hover:-translate-y-0.5 hover:bg-[#35c493]"
            >
              Access dashboard →
            </Link>
          </div>
        </section>
      </main>

      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-white/6 px-6 py-[34px] md:px-12">
        <span className="font-mono text-[10px] tracking-[0.2em] text-muted">
          © 2026 LITHOS SOLUTIONS
        </span>
        <Link
          href="/login"
          className="font-mono text-[10px] tracking-[0.2em] text-muted transition-colors hover:text-foreground"
        >
          ADMIN ACCESS
        </Link>
      </footer>
    </div>
  );
}
