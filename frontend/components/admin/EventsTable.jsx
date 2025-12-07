import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Eye, Trash2, Search } from 'lucide-react';

export function EventsTable({
  events,
  searchTerm,
  setSearchTerm,
  formatDate,
  getEventStatus,
  handleDeleteEvent,
}) {
  return (
    <Card className="bg-slate-950/70 border-slate-800/70 backdrop-blur-xl">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <CardTitle className="text-slate-50">All Events <span className="text-slate-500 text-lg ml-2">{events.length}</span></CardTitle>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-900/50 border-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-blue-900/50 focus:border-blue-700"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-slate-800">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-900/50 text-slate-400 font-medium">
              <tr>
                <th className="p-4">Title</th>
                <th className="p-4">Organizer</th>
                <th className="p-4">Category</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Attendees</th>
                <th className="p-4">Created</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {events.map((event) => {
                const status = getEventStatus(
                  event.startDate,
                  event.endDate
                );
                return (
                  <tr
                    key={event.id}
                    className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-4 font-medium text-slate-200">{event.title}</td>
                    <td className="p-4">
                      <div>
                        <div className="text-slate-200">{event.organizer.name}</div>
                        <div className="text-xs text-slate-500">
                          {event.organizer.email}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {event.category ? (
                        <Badge variant="outline" className="bg-slate-800/50 text-slate-300 border-slate-700">{event.category}</Badge>
                      ) : (
                        <span className="text-slate-600 text-sm">None</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-400">
                      {formatDate(event.startDate)}
                    </td>
                    <td className="p-4">
                      <Badge className={`${
                        status.label === 'Upcoming' ? 'bg-blue-500/10 text-blue-300 border-blue-500/20' : 
                        status.label === 'Ongoing' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' : 
                        'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      } border`} variant="outline">
                        {status.label}
                      </Badge>
                    </td>
                    <td className="p-4 text-center text-slate-400">
                      {event.attendeeCount}
                      {event.capacity && <span className="text-slate-600"> / {event.capacity}</span>}
                    </td>
                    <td className="p-4 text-slate-500">
                      {formatDate(event.createdAt)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/events/${event.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-white hover:bg-slate-800"
                            title="View Event">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
                          onClick={() =>
                            handleDeleteEvent(event.id, event.title)
                          }
                          title="Delete Event">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
