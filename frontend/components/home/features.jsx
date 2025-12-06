import { CheckCircle2, Plus, Search } from 'lucide-react';
import React from 'react';

function Features() {
  const features = [
    {
      icon: Search,
      title: 'Discover Events',
      description:
        "Find events that match your interests with our powerful search and filter tools. Never miss out on what's happening around campus.",
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-400',
      borderColor: 'border-blue-500/30',
    },
    {
      icon: CheckCircle2,
      title: 'Easy RSVP',
      description:
        'Reserve your spot with a single click and manage your attendance effortlessly. Get notifications and updates automatically.',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/30',
    },
    {
      icon: Plus,
      title: 'Organize Events',
      description:
        'Create and manage your own events with our intuitive organizer dashboard. Reach your audience and track attendance.',
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-400',
      borderColor: 'border-purple-500/30',
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-semibold text-slate-50 mb-4">
            Why Campus Connect?
          </h2>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            Everything you need to stay connected with your campus community
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative p-8 bg-slate-950/70 border border-slate-800/70 rounded-2xl hover:shadow-2xl hover:shadow-blue-900/20 transition-all duration-300 backdrop-blur-xl">
                <div className={`p-3 mb-6 ${feature.iconBg} border ${feature.borderColor} rounded-xl inline-flex`}>
                  <Icon className={`w-5 h-5 ${feature.iconColor}`} />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-50">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Features;
