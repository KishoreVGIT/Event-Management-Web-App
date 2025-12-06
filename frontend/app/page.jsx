'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { EventsShowcase } from '@/components/events-showcase';
import { Calendar, Users } from 'lucide-react';
import Hero from '@/components/home/hero';
import Features from '@/components/home/features';
import Explore from '@/components/home/explore';
import Cta from '@/components/home/cta';

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <Hero />
      {/* Features Section */}
      <Features />

      {/* Featured Events Section */}
      <Explore />

      {/* CTA Section */}
      <Cta />
    </main>
  );
}
