import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit2, MoreVertical, Users } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function EventsList({
  events,
  onViewAttendees,
  onPostpone,
  onCancel,
  onDelete,
}) {
  const formatEventDate = (startDate, endDate) => {
    if (!startDate) return 'Date TBA';

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;

    const formatOptions = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };

    const timeOptions = {
      hour: '2-digit',
      minute: '2-digit',
    };

    if (end) {
      const startDay = new Date(start);
      startDay.setHours(0, 0, 0, 0);
      const endDay = new Date(end);
      endDay.setHours(0, 0, 0, 0);

      if (endDay > startDay) {
        return `${start.toLocaleDateString(
          'en-US',
          formatOptions
        )} ${start.toLocaleTimeString(
          'en-US',
          timeOptions
        )} - ${end.toLocaleDateString(
          'en-US',
          formatOptions
        )} ${end.toLocaleTimeString('en-US', timeOptions)}`;
      } else {
        return `${start.toLocaleDateString(
          'en-US',
          formatOptions
        )}, ${start.toLocaleTimeString(
          'en-US',
          timeOptions
        )} - ${end.toLocaleTimeString('en-US', timeOptions)}`;
      }
    }

    return `${start.toLocaleDateString(
      'en-US',
      formatOptions
    )} at ${start.toLocaleTimeString('en-US', timeOptions)}`;
  };

  return (
    <>
      <div className="rounded-2xl border border-slate-800/70 bg-slate-950/70 backdrop-blur-xl overflow-hidden shadow-xl shadow-blue-900/5">
        <Table>
          <TableHeader className="bg-slate-900/50">
            <TableRow className="border-b border-slate-800 hover:bg-transparent">
              <TableHead className="text-slate-400 font-medium">Event</TableHead>
              <TableHead className="text-slate-400 font-medium">Date & Time</TableHead>
              <TableHead className="text-slate-400 font-medium">Status</TableHead>
              <TableHead className="text-slate-400 font-medium">Stats</TableHead>
              <TableHead className="text-right text-slate-400 font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id} className="border-b border-slate-800/50 hover:bg-slate-900/30 transition-colors">
                <TableCell className="font-medium">
                  <div className="text-slate-200 font-semibold">{event.title}</div>
                  {event.location && (
                    <div className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                       <span className="truncate max-w-[200px]">{event.location}</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-sm text-slate-300">
                    {new Date(event.startDate).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {new Date(event.startDate).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    className={`
                      ${
                        event.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : event.status === 'cancelled'
                          ? 'bg-red-500/10 text-red-400 border-red-500/20'
                          : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                      } border
                    `}>
                    {event.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-slate-500" />
                      <span>
                        <span className="text-slate-200">{event.attendeeCount}</span>
                        <span className="text-slate-600 mx-1">/</span>
                        {event.capacity || '∞'}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-full"
                      onClick={() => onViewAttendees(event)}>
                      <Users className="w-4 h-4" />
                    </Button>
                    <Link href={`/organizer/events/edit/${event.id}`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-full">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-full">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-slate-950 border-slate-800 text-slate-200 w-48">
                        <DropdownMenuItem className="text-slate-300 focus:bg-slate-900 focus:text-slate-100 cursor-pointer">
                          <Link href={`/events/${event.id}`} className="flex w-full">
                            View Public Page
                          </Link>
                        </DropdownMenuItem>
                        {event.status === 'active' && (
                          <>
                            <DropdownMenuItem
                              onClick={() => {
                                if (onPostpone) onPostpone(event);
                              }}
                              className="focus:bg-slate-900 focus:text-slate-100 cursor-pointer">
                              Postpone Event
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer"
                              onClick={() => {
                                if (onCancel) onCancel(event);
                              }}>
                              Cancel Event
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem
                          className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer"
                          onClick={() => onDelete(event.id)}>
                          Delete Event
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
