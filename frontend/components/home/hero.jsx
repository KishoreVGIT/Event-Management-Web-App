import { Search, Sparkles } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { Button } from '../ui/button';

function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-blue-50 dark:bg-blue-950/20" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Discover Amazing Campus Events
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            The Hub for
            <br />
            <span className="text-primary">Campus Events</span>
          </h1>

          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            Your one-stop platform for discovering, organizing, and
            attending campus events. Connect with your community and
            never miss out on what's happening around you.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/events">
              <Button className="hover:scale-105">
                <Search className="w-5 h-5 mr-1" />
                Browse All Events
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                variant="outline"
                className="border-primary bg-transparent px-6 hover:scale-105">
                Get Started Free
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                1000+
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Events Hosted
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                5000+
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Active Students
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                50+
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Organizations
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                100%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Free to Use
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
