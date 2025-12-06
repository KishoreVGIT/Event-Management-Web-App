import Link from 'next/link';
import React from 'react';
import { Button } from '../ui/button';

import { EventsShowcase } from '../events-showcase';
import { Calendar, ArrowRight } from 'lucide-react';

function Explore() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl font-semibold text-slate-50 mb-2">
              Explore Events
            </h2>
            <p className="text-base sm:text-lg text-slate-300">
              Discover the hottest events happening on campus
            </p>
          </div>
          <Link href="/events" className="hidden sm:block">
            <Button
              variant="outline"
              size="lg"
              className="h-11 px-6 border-slate-700 text-slate-300 bg-slate-950/70 hover:bg-slate-900 hover:border-slate-600 hover:text-slate-100 rounded-full transition-all">
              View All Events
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
        <EventsShowcase />
        <div className="mt-8 text-center sm:hidden">
          <Link href="/events">
            <Button
              variant="outline"
              size="lg"
              className="w-full h-12 border-slate-700 text-slate-300 bg-slate-950/70 hover:bg-slate-900 hover:border-slate-600 hover:text-slate-100 rounded-full">
              View All Events
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Explore;
