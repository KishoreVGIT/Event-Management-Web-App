import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Tag } from 'lucide-react';

export function DashboardEventCard({ event, formatDate }) {
  return (
    <Card className="group hover:shadow-2xl hover:shadow-blue-900/20 transition-all duration-300 bg-slate-950/70 border-slate-800/70 backdrop-blur-xl">
      <CardHeader className="border-b border-slate-800/70 pb-4">
        <CardTitle className="text-lg font-semibold text-slate-50 line-clamp-1 group-hover:text-blue-400 transition-colors">
          {event.title}
        </CardTitle>
        <CardDescription className="line-clamp-2 text-slate-400 text-xs mt-2">
          {event.description || 'No description'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-blue-500/70 mt-0.5" />
            <span className="text-slate-300 font-medium">
              {formatDate(event.startDate)}
            </span>
          </div>

          {event.location && (
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-slate-500 mt-0.5" />
              <span className="text-slate-400 line-clamp-1">
                {event.location}
              </span>
            </div>
          )}

          {event.category && (
            <div className="flex items-start gap-2">
              <Tag className="w-4 h-4 text-slate-500 mt-0.5" />
              <Badge
                variant="secondary"
                className="bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700 text-[10px] h-5 px-2">
                {event.category}
              </Badge>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <Users className="w-4 h-4 text-slate-500" />
            <span className="text-slate-400">
              <span className="text-slate-200 font-semibold">{event.attendeeCount}</span>{' '}
              {event.capacity ? `/ ${event.capacity}` : ''} attending
            </span>
          </div>
        </div>

        <Link href={`/events/${event.id}`} className="block pt-2">
          <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 border-0 h-9 rounded-lg text-xs font-medium">
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
