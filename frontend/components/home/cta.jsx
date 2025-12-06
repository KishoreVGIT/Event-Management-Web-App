import { Users } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { Button } from '../ui/button';

function Cta() {
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 bg-primary"></div>

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
          Join Campus Connect today and become part of an engaged
          community. Discover events, make connections, and create
          memories.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8 h-14 bg-white text-blue-600 hover:bg-gray-100 shadow-xl">
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
  );
}

export default Cta;
