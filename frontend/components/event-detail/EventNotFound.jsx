import Link from 'next/link';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function EventNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 px-4">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="w-20 h-20 bg-slate-900/60 border border-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-2 shadow-xl shadow-blue-900/40">
          <Calendar className="w-9 h-9 text-slate-400" />
        </div>
        <h2 className="text-2xl font-semibold text-slate-50">
          Event not found
        </h2>
        <p className="text-sm text-slate-400">
          This event doesn&apos;t exist anymore or has been removed by its
          organizer.
        </p>
        <Link href="/events">
          <Button className="mt-2 bg-blue-600 hover:bg-blue-700 text-sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to events
          </Button>
        </Link>
      </div>
    </div>
  );
}
