import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-slate-950/70 border border-slate-800/70 backdrop-blur-xl rounded-2xl shadow-xl shadow-blue-900/5">
      <div className="w-20 h-20 bg-slate-900/80 rounded-full flex items-center justify-center mb-6 border border-slate-800 shadow-inner">
        <Calendar className="w-10 h-10 text-slate-500" />
      </div>
      <h3 className="text-xl font-bold text-slate-50 mb-2">
        No events created yet
      </h3>
      <p className="text-slate-400 mb-6">
        You haven&apos;t created any events yet.
      </p>
      <Link href="/organizer/events/new">
        <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-500/30 transition-all hover:scale-105">
          Create Your First Event
        </Button>
      </Link>
    </div>
  );
}
