'use client';

import Hero from '@/components/home/hero';
import Features from '@/components/home/features';
import Explore from '@/components/home/explore';
import Cta from '@/components/home/cta';

export default function Home() {
  return (
    <main className="bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      <Hero />
      <Features />
      <Explore />
      <Cta />
    </main>
  );
}
