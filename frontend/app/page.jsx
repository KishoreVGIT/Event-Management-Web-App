'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { EventsShowcase } from '@/components/events-showcase';
import { Calendar, Users, Sparkles, Search, CheckCircle2, Plus } from 'lucide-react';

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-blue-50 dark:bg-blue-950/20"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Discover Amazing Campus Events
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              The Citywide
              <br />
              <span className="text-blue-600 dark:text-blue-400">
                Campus Festival
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              Your one-stop platform for discovering, organizing, and attending campus events.
              Connect with your community and never miss out on what's happening around you.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/events">
                <Button size="lg" className="text-lg px-8 h-14 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30">
                  <Search className="w-5 h-5 mr-2" />
                  Browse All Events
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="lg" variant="outline" className="text-lg px-8 h-14 border-2 hover:bg-gray-50 dark:hover:bg-gray-800">
                  Get Started Free
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">1000+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Events Hosted</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">5000+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Active Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">50+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Organizations</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">100%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Free to Use</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Campus Connect?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Everything you need to stay connected with your campus community
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group relative p-8 bg-blue-50 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl hover:shadow-xl transition-all duration-300 border border-blue-100 dark:border-blue-800">
              <div className="w-16 h-16 mb-6 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                Discover Events
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Find events that match your interests with our powerful search and filter tools. Never miss out on what's happening around campus.
              </p>
            </div>
            <div className="group relative p-8 bg-blue-50 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl hover:shadow-xl transition-all duration-300 border border-blue-100 dark:border-blue-800">
              <div className="w-16 h-16 mb-6 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                Easy RSVP
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Reserve your spot with a single click and manage your attendance effortlessly. Get notifications and updates automatically.
              </p>
            </div>
            <div className="group relative p-8 bg-blue-50 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl hover:shadow-xl transition-all duration-300 border border-blue-100 dark:border-blue-800">
              <div className="w-16 h-16 mb-6 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                Organize Events
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Create and manage your own events with our intuitive organizer dashboard. Reach your audience and track attendance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Featured Events
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Discover the hottest events happening on campus
              </p>
            </div>
            <Link href="/events">
              <Button variant="outline" size="lg" className="hidden sm:flex">
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

      {/* CTA Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-blue-600"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
            <Users className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">
              Join 5000+ Active Students
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join Campus Connect today and become part of an engaged community. Discover events, make connections, and create memories.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="text-lg px-8 h-14 bg-white text-blue-600 hover:bg-gray-100 shadow-xl">
                Sign Up Now - It's Free
              </Button>
            </Link>
            <Link href="/signin">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 h-14 bg-transparent text-white border-2 border-white hover:bg-white hover:text-blue-600 transition-all">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
