import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, UserCircle, MapPin, Tag } from 'lucide-react';

export function EventHero({ event, status, organizerName, formatEventDate }) {
  const statusStyles = {
    upcoming: 'bg-blue-500/90 text-white ring-2 ring-blue-400/60',
    ongoing: 'bg-emerald-500/90 text-white ring-2 ring-emerald-400/60',
    past: 'bg-zinc-500/90 text-white ring-2 ring-zinc-400/60',
  };

  return (
    <div className="relative w-full min-h-[280px] sm:min-h-[340px] lg:min-h-[420px]">
      <div className="relative h-[280px] sm:h-[340px] lg:h-[420px] overflow-hidden">
        {/* Background image / gradient */}
        <div className="absolute inset-0">
          {event.imageUrl ? (
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              priority
              className="object-cover scale-105 blur-[0.5px]"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-700 via-indigo-600 to-slate-900" />
          )}
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-slate-900/10" />

        {/* Content */}
        <div className="relative max-w-6xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-end pb-8">
          <div className="flex flex-col gap-4 w-full">
            <div className="flex items-center justify-between gap-4">
              <Link href="/events">
                <div className="flex gap-1 items-center px-3 py-1 border rounded-full border-slate-700 bg-slate-950/60 text-slate-100 hover:bg-slate-900 hover:border-slate-600 hover:text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </div>
              </Link>

              <span
                className={`px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-full backdrop-blur-md shadow-lg flex items-center gap-2 ${statusStyles[status]}`}
              >
                <span className="inline-block w-2 h-2 rounded-full bg-white/80" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>

            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/70 border border-slate-700/60 text-xs font-medium text-slate-300">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatEventDate(event.startDate, event.endDate)}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-slate-50">
                {event.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
                <div className="inline-flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-900/70 border border-slate-700 flex items-center justify-center">
                    <UserCircle className="w-4 h-4 text-slate-300" />
                  </div>
                  <span>
                    Organized by{' '}
                    <span className="font-medium text-slate-100">
                      {organizerName}
                    </span>
                  </span>
                </div>

                {event.location && (
                  <div className="inline-flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-300" />
                    <span className="truncate max-w-xs">{event.location}</span>
                  </div>
                )}

                {event.category && (
                  <div className="inline-flex items-center gap-2">
                    <Tag className="w-4 h-4 text-slate-300" />
                    <span>{event.category}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
