import Link from 'next/link';
import React from 'react';
import { Button } from '../ui/button';

import { EventsShowcase } from '../events-showcase';
import { Calendar } from 'lucide-react';

function Explore() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Explore
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Discover the hottest events happening on campus
            </p>
          </div>
          <Link href="/events">
            <Button
              variant="outline"
              size="lg"
              className="hidden sm:flex">
              <Calendar className="w-4 h-4 mr-2" />
              View All Events
            </Button>
          </Link>
        </div>
        <EventsShowcase />
        <div className="mt-8 text-center sm:hidden">
          <Link href="/events">
            <Button variant="outline" size="lg" className="w-full">
              <Calendar className="w-4 h-4 mr-2" />
              View All Events
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Explore;
