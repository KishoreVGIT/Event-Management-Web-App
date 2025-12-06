import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function DashboardHeader({ user }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-50 mb-2">
          Organizer Dashboard
        </h1>
        <p className="text-slate-400">
          Welcome back, <span className="font-medium text-slate-200">{user?.name}</span>
          {user?.organizationName && (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
              {user.organizationName}
            </span>
          )}
        </p>
      </div>
      <Link href="/organizer/events/new">
        <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-6 shadow-lg shadow-blue-600/20">
          <Plus className="w-4 h-4 mr-2" />
          Create New Event
        </Button>
      </Link>
    </div>
  );
}
