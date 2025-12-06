import { Search, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import { Button } from '../ui/button';

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      {/* Hero Banner Image Section */}
      <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[80vh]">
        <Image
          src="/hero-banner.jpg"
          alt="Campus Connect"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/30 to-slate-950" />
      </div>

      {/* Content Section Below Banner */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full mb-6 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-300">
              Discover Amazing Campus Events
            </span>
          </div>

          <p className="text-lg sm:text-xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            Your one-stop platform for discovering, organizing, and
            attending campus events. Connect with your community and
            never miss out on what's happening around you.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/events">
              <Button className="h-12 px-8 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-base font-medium shadow-lg shadow-blue-500/30 transition-all hover:scale-105">
                <Search className="w-5 h-5 mr-2" />
                Browse All Events
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                variant="outline"
                className="h-12 px-8 border-slate-700 text-slate-300 bg-slate-950/70 hover:bg-slate-900 hover:border-slate-600 hover:text-slate-100 rounded-full text-base font-medium transition-all hover:scale-105">
                Get Started Free
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 sm:mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { value: '1000+', label: 'Events Hosted' },
              { value: '5000+', label: 'Active Students' },
              { value: '50+', label: 'Organizations' },
              { value: '100%', label: 'Free to Use' },
            ].map((stat, index) => (
              <div
                key={index}
                className="text-center p-4 rounded-2xl bg-slate-950/50 border border-slate-800/50 backdrop-blur-sm">
                <div className="text-3xl sm:text-4xl font-bold text-slate-50 mb-1">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-slate-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
