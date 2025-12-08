'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DateTimeRangePicker } from '@/components/ui/date-time-range-picker';
import { FieldError } from '@/components/ui/field';
import { API_URL } from '@/lib/constants';
import { toast } from 'sonner';

const postponeSchema = yup.object().shape({
  newStartDate: yup.string().required('New start date is required'),
  newEndDate: yup
    .string()
    .nullable()
    .test('is-after-start', 'End date/time must be after start date/time', function(value) {
      const { newStartDate } = this.parent;
      if (!value || !newStartDate) return true;
      return new Date(value) > new Date(newStartDate);
    }),
});

export function PostponeEventDialog({ event, open, onOpenChange, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(postponeSchema),
    defaultValues: {
      newStartDate: event?.startDate || '',
      newEndDate: event?.endDate || '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/events/${event.id}/postpone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        reset();
        onOpenChange(false);
        if (onSuccess) {
          onSuccess(result);
        }
      } else {
        toast.error(result.error || 'Failed to postpone event');
      }
    } catch (err) {
      toast.error('Failed to postpone event');
      console.error('Postpone error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-slate-950 border-slate-800 text-slate-50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-50">
            <Calendar className="h-5 w-5 text-blue-500" />
            Postpone Event
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Reschedule &quot;{event?.title}&quot; to a new date and time. All attendees will
            be notified via email.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2 text-slate-200">Current Date & Time</h4>
              <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-md text-sm">
                <div className="flex items-center gap-2 text-slate-300">
                  <Clock className="h-4 w-4 text-slate-500" />
                  {event?.startDate &&
                    new Date(event.startDate).toLocaleString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  {event?.endDate && (
                    <>
                      {' '}
                      -{' '}
                      {new Date(event.endDate).toLocaleString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2 text-slate-200">New Date & Time *</h4>
              <Controller
                name="newStartDate"
                control={control}
                render={({ field: startField }) => (
                  <Controller
                    name="newEndDate"
                    control={control}
                    render={({ field: endField }) => (
                      <DateTimeRangePicker
                        startValue={startField.value}
                        endValue={endField.value}
                        onStartChange={startField.onChange}
                        onEndChange={endField.onChange}
                        startError={errors.newStartDate?.message}
                        endError={errors.newEndDate?.message}
                      />
                    )}
                  />
                )}
              />
            </div>

            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-md text-sm">
              <p className="text-blue-300">
                <strong>Note:</strong> All attendees who have RSVP&apos;d to this event will
                receive an email notification about the new date and time.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="border-slate-700 bg-slate-900/50 text-slate-300 hover:bg-slate-800 hover:text-white">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white">
              {loading ? 'Postponing...' : 'Postpone Event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
