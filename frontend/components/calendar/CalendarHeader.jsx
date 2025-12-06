import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, List } from 'lucide-react';

export function CalendarHeader() {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-50 flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-blue-400" />
            </div>
            Events Calendar
          </h1>
          <p className="text-slate-400">
            View all campus events in calendar format
          </p>
        </div>
        <Link href="/events">
          <Button
            variant="outline"
            className="border-slate-700 text-slate-300 bg-slate-950/70 hover:bg-slate-900 hover:border-slate-600 hover:text-slate-100 rounded-full">
            <List className="w-4 h-4 mr-2" />
            List View
          </Button>
        </Link>
      </div>
    </div>
  );
}
