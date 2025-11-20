'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function EventsShowcase() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_URL}/api/events`);
      const data = await response.json();

      if (Array.isArray(data)) {
        setEvents(data);
      } else {
        console.error('API returned non-array data:', data);
        setEvents([]);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const formatEventDate = (startDate, endDate) => {
    if (!startDate) return 'Date TBA';

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;

    const formatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };

    const timeOptions = {
      hour: '2-digit',
      minute: '2-digit',
    };

    if (end) {
      return `${start.toLocaleDateString(
        'en-US',
        formatOptions
      )} - ${end.toLocaleDateString('en-US', formatOptions)}`;
    }

    return start.toLocaleDateString('en-US', formatOptions);
  };

  const getEventStatus = (startDate, endDate) => {
    if (!startDate) return 'upcoming';

    const now = new Date();
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : start;

    if (now < start) return 'upcoming';
    if (now > end) return 'past';
    return 'ongoing';
  };

  if (loading) {
    return (
      <div className="w-full py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          No events available at the moment.
        </p>
        <Link href="/signup">
          <Button>Get Started</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.slice(0, 6).map((event) => {
        const status = getEventStatus(event.startDate, event.endDate);
        return (
          <Card
            key={event.id}
            className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="line-clamp-1">{event.title}</CardTitle>
                  <CardDescription className="mt-1">
                    by {event.user.name}
                  </CardDescription>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ml-2 ${
                    status === 'upcoming'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : status === 'ongoing'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}>
                  {status}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {formatEventDate(event.startDate, event.endDate)}
                </div>

                {event.description && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                    {event.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-3 border-t dark:border-gray-700">
                  <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    {event.attendeeCount}
                  </div>
                  <Link href={`/events/${event.id}`}>
                    <Button size="sm" variant="default">
                      View Event
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
