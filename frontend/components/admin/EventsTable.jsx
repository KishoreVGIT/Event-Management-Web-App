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
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>All Events ({events.length})</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Title</th>
                <th className="text-left p-3">Organizer</th>
                <th className="text-left p-3">Category</th>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Attendees</th>
                <th className="text-left p-3">Created</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => {
                const status = getEventStatus(
                  event.startDate,
                  event.endDate
                );
                return (
                  <tr
                    key={event.id}
                    className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="p-3 font-medium">{event.title}</td>
                    <td className="p-3">
                      <div>
                        <div>{event.organizer.name}</div>
                        <div className="text-xs text-gray-500">
                          {event.organizer.email}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      {event.category ? (
                        <Badge variant="secondary">{event.category}</Badge>
                      ) : (
                        <span className="text-gray-400 text-sm">None</span>
                      )}
                    </td>
                    <td className="p-3">
                      {formatDate(event.startDate)}
                    </td>
                    <td className="p-3">
                      <Badge className={`${status.color} text-white`}>
                        {status.label}
                      </Badge>
                    </td>
                    <td className="p-3">
                      {event.attendeeCount}
                      {event.capacity && ` / ${event.capacity}`}
                    </td>
                    <td className="p-3">
                      {formatDate(event.createdAt)}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Link href={`/events/${event.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            title="View Event">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="destructive"
                          size="sm"
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
