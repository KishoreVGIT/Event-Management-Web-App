import { CheckCircle2, Plus, Search } from 'lucide-react';
import React from 'react';

function Features() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Campus Connect?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to stay connected with your campus
            community
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group relative p-8 bg-blue-50 rounded-2xl hover:shadow-xl transition-all duration-300 border border-blue-100 ">
            <div className="p-4 mb-6 bg-primary rounded-xl inline-flex">
              <Search className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900 ">
              Discover Events
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Find events that match your interests with our powerful
              search and filter tools. Never miss out on what's
              happening around campus.
            </p>
          </div>
          <div className="group relative p-8 bg-blue-50 rounded-2xl hover:shadow-xl transition-all duration-300 border border-blue-100">
            <div className="p-4 mb-6 bg-primary rounded-xl inline-flex">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">
              Easy RSVP
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Reserve your spot with a single click and manage your
              attendance effortlessly. Get notifications and updates
              automatically.
            </p>
          </div>
          <div className="group relative p-8 bg-blue-50 rounded-2xl hover:shadow-xl transition-all duration-300 border border-blue-100">
            <div className="p-4 mb-6 bg-primary rounded-xl inline-flex">
              <Plus className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">
              Organize Events
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Create and manage your own events with our intuitive
              organizer dashboard. Reach your audience and track
              attendance.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Features;
