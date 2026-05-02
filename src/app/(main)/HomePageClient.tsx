"use client";

import Link from 'next/link';
import { ArrowRight, BarChart3, GitCompare, Bell } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { StatePulseLogo } from '@/components/StatePulseLogo';

export default function HomePageClient() {
  const { isSignedIn } = useUser();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-6 md:px-8 overflow-hidden text-center">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            aria-hidden
            className="w-full h-full object-cover"
            src="/hero-bg.jpg"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(16,44,22,0.82) 0%, rgba(26,70,35,0.75) 100%)' }} />
        </div>

        <div className="relative z-10 max-w-5xl flex flex-col items-center">
          {/* Logo mark */}
          <div className="mb-10 transition-transform duration-700 hover:scale-105 drop-shadow-[0_0_30px_rgba(122,181,92,0.4)]">
            <StatePulseLogo size={160} className="text-primary" />
          </div>

          <span className="font-label text-xs uppercase tracking-[0.3em] text-white/60 mb-4 block font-bold">
            Legislative Intelligence
          </span>

          <h1 className="text-5xl md:text-7xl font-headline font-bold leading-tight mb-6 text-white">
            Welcome to StatePulse
          </h1>

          <p className="text-lg md:text-xl text-white/80 max-w-2xl font-body leading-relaxed mb-10">
            Your comprehensive source for fast legislative tracking and policy
            analysis. Stay informed, make impactful decisions.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            {!isSignedIn ? (
              <Link
                href="/sign-up"
                className="bg-primary text-primary-foreground px-10 py-4 rounded-xl font-label font-bold text-sm tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20"
              >
                GET STARTED
              </Link>
            ) : (
              <Link
                href="/tracker"
                className="bg-primary text-primary-foreground px-10 py-4 rounded-xl font-label font-bold text-sm tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20"
              >
                JUMP BACK IN <ArrowRight className="inline ml-2 h-4 w-4" />
              </Link>
            )}
            <Link
              href="/legislation"
              className="bg-white/15 backdrop-blur-md text-white border border-white/30 px-10 py-4 rounded-xl font-label font-bold text-sm tracking-widest hover:bg-white/25 transition-all"
            >
              VIEW RECENT UPDATES
            </Link>
          </div>
        </div>
      </section>

      {/* ── Intelligence Grid ────────────────────────────────────────────────── */}
      <section className="px-6 md:px-8 py-20 max-w-screen-xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* Large Feature Card */}
          <div className="md:col-span-8 bg-card rounded-3xl p-10 relative overflow-hidden group border border-border/40">
            <div className="relative z-10 flex flex-col h-full min-h-[320px]">
              <div className="flex justify-between items-start mb-16">
                <span className="font-label text-[10px] font-bold tracking-widest text-primary uppercase px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                  Active Monitoring
                </span>
                <BarChart3 className="text-primary h-8 w-8" />
              </div>
              <h2 className="text-3xl md:text-4xl font-headline mb-3">
                The State Policy Ledger
              </h2>
              <p className="text-muted-foreground font-body text-base max-w-md">
                Real-time legislative tracking across the top 5 energy producing states. Watch the
                policy landscape evolve as it happens.
              </p>
              <div className="mt-auto pt-10">
                <Link
                  href="/tracker"
                  className="flex items-center gap-2 text-primary font-label text-sm font-bold group-hover:translate-x-2 transition-transform"
                >
                  EXPLORE THE LEDGER <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            {/* Ambient sparkline background */}
            <div className="absolute right-0 bottom-0 opacity-15 w-1/2 h-full pointer-events-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt=""
                aria-hidden
                className="w-full h-full object-cover"
                src="/sparkline-bg.jpg"
              />
            </div>
          </div>

          {/* Secondary Column */}
          <div className="md:col-span-4 flex flex-col gap-6">
            <Link
              href="/comparison"
              className="bg-card rounded-3xl p-8 flex-1 group hover:bg-muted transition-colors border border-border/40 block"
            >
              <GitCompare className="text-primary h-7 w-7 mb-4" />
              <h3 className="text-2xl font-headline mb-2">Policy Comparison</h3>
              <p className="text-muted-foreground text-sm font-body">
                Side-by-side analysis of legislation across states.
              </p>
            </Link>

            <div className="bg-primary/10 rounded-3xl p-8 flex-1 relative overflow-hidden border border-primary/20">
              <div className="relative z-10">
                <Bell className="text-accent h-7 w-7 mb-4" />
                <h3 className="text-2xl font-headline text-foreground mb-2">
                  New Legislative Updates
                </h3>
                <p className="text-muted-foreground text-sm font-body">
                  Stay ahead with real-time alerts on bills that matter to you.
                </p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* ── The Pulse: Horizontal Policy Stream ─────────────────────────────── */}
      <section className="py-20 bg-card/50">
        <div className="max-w-screen-xl mx-auto px-6 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-2xl">
              <span className="font-label text-xs uppercase tracking-widest text-secondary font-bold mb-3 block">
                The Pulse
              </span>
              <h2 className="text-4xl md:text-5xl font-headline leading-tight">
                Legislative{' '}
                <span className="italic font-light">Activity Patterns</span>
              </h2>
            </div>
            <div className="flex gap-4">
              <div className="bg-card rounded-xl p-4 text-center min-w-[110px] border border-border/40">
                <div className="text-primary text-3xl font-headline font-bold">5</div>
                <div className="text-[10px] font-label text-muted-foreground uppercase">States Tracked</div>
              </div>
              <div className="bg-card rounded-xl p-4 text-center min-w-[110px] border border-border/40">
                <div className="text-accent text-3xl font-headline font-bold">Live</div>
                <div className="text-[10px] font-label text-muted-foreground uppercase">Updates</div>
              </div>
            </div>
          </div>

          {/* Horizontal scrolling policy cards */}
          <div className="flex overflow-x-auto gap-6 pb-10 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {[
              {
                icon: '🌿',
                title: 'Environmental Policy',
                location: 'Multi-State',
                desc: 'Tracking clean energy mandates and emissions standards across the western states.',
                impact: 'High',
                updated: '1h ago',
                href: '/tracker',
              },
              {
                icon: '⚡',
                title: 'Energy Policy',
                location: 'Multi-State',
                desc: 'New legislation governing electricity production and grid modernization across top energy-producing states.',
                impact: 'Critical',
                updated: '2h ago',
                href: '/tracker',
              },
              {
                icon: '🌬️',
                title: 'Renewables',
                location: 'National',
                desc: 'Wind and solar expansion bills advancing through state legislatures as clean energy targets tighten.',
                impact: 'High',
                updated: '4h ago',
                href: '/tracker',
              },
            ].map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="min-w-[340px] bg-card rounded-3xl border border-border/40 p-8 hover:bg-muted transition-colors flex-shrink-0 block"
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                    {card.icon}
                  </div>
                  <div>
                    <h4 className="font-headline text-lg">{card.title}</h4>
                    <p className="text-[10px] font-label text-muted-foreground uppercase">
                      {card.location}
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground font-body text-sm mb-5 leading-relaxed">
                  {card.desc}
                </p>
                <div className="flex justify-between items-center text-xs font-label">
                  <span className="text-primary font-bold">Impact: {card.impact}</span>
                  <span className="text-muted-foreground/60">Updated {card.updated}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA / Sign-up ────────────────────────────────────────────────────── */}
      <section className="py-28 px-6 md:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-headline italic mb-6">
            Ready to track what matters?
          </h2>
          <p className="text-lg text-muted-foreground font-body mb-10 max-w-xl mx-auto leading-relaxed">
            Join civic-minded citizens, researchers, and policy professionals
            monitoring U.S. state legislation in real time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isSignedIn ? (
              <Link
                href="/sign-up"
                className="bg-primary text-primary-foreground px-10 py-4 rounded-xl font-label font-bold text-sm tracking-widest hover:scale-105 transition-all"
              >
                CREATE FREE ACCOUNT
              </Link>
            ) : (
              <Link
                href="/tracker"
                className="bg-primary text-primary-foreground px-10 py-4 rounded-xl font-label font-bold text-sm tracking-widest hover:scale-105 transition-all"
              >
                GO TO TRACKER
              </Link>
            )}
            <Link
              href="/about"
              className="bg-muted text-foreground px-10 py-4 rounded-xl font-label font-bold text-sm tracking-widest hover:bg-muted/80 transition-all"
            >
              LEARN MORE
            </Link>
          </div>
        </div>
      </section>

      {/* ── Support banner ───────────────────────────────────────────────────── */}
      <section className="py-12 px-6 md:px-8 bg-primary/5 border-t border-primary/10">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-muted-foreground font-body text-sm mb-4">
            StatePulse is free and open-source. If you find it valuable, consider supporting our work.
          </p>
          <a
            href="https://buymeacoffee.com/timberlake2025"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-primary/10 text-primary border border-primary/20 px-6 py-2 rounded-xl font-label text-sm font-bold hover:bg-primary/20 transition-colors"
          >
            Support StatePulse ☕
          </a>
        </div>
      </section>
    </div>
  );
}
