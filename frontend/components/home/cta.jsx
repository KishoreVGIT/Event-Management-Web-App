import { Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { Button } from '../ui/button';

function Cta() {
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-slate-950 to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10" />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 backdrop-blur-3xl" />

      <div className="relative max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 backdrop-blur-sm rounded-full mb-6">
          <Users className="w-4 h-4 text-blue-300" />
          <span className="text-sm font-medium text-slate-100">
            Join 5000+ Active Students
          </span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-slate-50 mb-6 tracking-tight">
          Ready to Get Started?
        </h2>
        <p className="text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
          Join Campus Connect today and become part of an engaged
          community. Discover events, make connections, and create
          memories.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup">
            <Button
              size="lg"
              className="h-14 px-8 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-base font-medium shadow-lg shadow-blue-500/30 transition-all hover:scale-105">
              Sign Up Now - It's Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link href="/signin">
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 bg-slate-950/70 text-slate-100 border-slate-700 hover:bg-slate-900 hover:border-slate-600 rounded-full text-base font-medium transition-all hover:scale-105">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Cta;
