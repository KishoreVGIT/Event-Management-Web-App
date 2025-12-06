'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Search, Mail, X } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function AttendeesModal({ event, open, onOpenChange, getToken }) {
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (open && event) {
      fetchAttendees();
    }
  }, [open, event]);

  const fetchAttendees = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(
        `${API_URL}/api/events/${event.id}/attendees`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAttendees(data);
      }
    } catch (error) {
      console.error('Error fetching attendees:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAttendees = attendees.filter((attendee) =>
    attendee.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    attendee.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-slate-950/95 border-slate-800/70 text-slate-50 backdrop-blur-xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-50 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" />
            Event Attendees
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {event?.title}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 overflow-hidden">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-900/70 border-slate-800/70 text-slate-100 placeholder:text-slate-500 rounded-xl focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between px-1">
            <p className="text-sm text-slate-400">
              {filteredAttendees.length} {filteredAttendees.length === 1 ? 'attendee' : 'attendees'}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>

          {/* Attendees List */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-2">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div className="w-10 h-10 rounded-full border-4 border-slate-700 border-t-blue-500 animate-spin" />
                <p className="text-sm text-slate-400">Loading attendees...</p>
              </div>
            ) : filteredAttendees.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <Users className="w-12 h-12 text-slate-600" />
                <p className="text-slate-400">
                  {searchQuery ? 'No attendees match your search' : 'No attendees yet'}
                </p>
              </div>
            ) : (
              filteredAttendees.map((attendee, index) => (
                <div
                  key={attendee.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800/50 hover:bg-slate-900/70 hover:border-slate-700/70 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-slate-100">
                        {attendee.user.name}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Mail className="w-3 h-3" />
                        <span>{attendee.user.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                      {attendee.status || 'Confirmed'}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(attendee.rsvpDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800/70">
            <Button
              onClick={() => onOpenChange(false)}
              className="bg-slate-800/70 text-slate-300 hover:bg-slate-800 border-slate-700 rounded-full">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
