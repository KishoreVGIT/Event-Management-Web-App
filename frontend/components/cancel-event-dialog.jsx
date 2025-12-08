'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FieldLabel } from '@/components/ui/field';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { API_URL } from '@/lib/constants';

export function CancelEventDialog({ event, open, onOpenChange, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reason, setReason] = useState('');

  const handleCancel = async () => {
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/events/${event.id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: reason || null }),
      });

      const result = await response.json();

      if (response.ok) {
        setReason('');
        onOpenChange(false);
        if (onSuccess) {
          onSuccess(result);
        }
      } else {
        setError(result.error || 'Failed to cancel event');
      }
    } catch (err) {
      setError('Failed to cancel event');
      console.error('Cancel error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Cancel Event
          </DialogTitle>
          <DialogDescription className='text-white'>
            Are you sure you want to cancel &quot;{event?.title}&quot;? This action will
            notify all attendees via email.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-md">
              {error}
            </div>
          )}

          <div>
            <FieldLabel htmlFor="reason">Reason for Cancellation (Optional)</FieldLabel>
            <Textarea
              id="reason"
              placeholder="Let attendees know why this event is being cancelled..."
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={loading}
              className='text-white'
            />
            <p className="text-xs text-gray-500 mt-1">
              This message will be included in the cancellation email.
            </p>
          </div>

          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md text-sm">
            <p className="text-yellow-800 dark:text-yellow-200">
              <strong>Warning:</strong> All {event?.attendeeCount || 0} attendees will be
              notified about this cancellation. The event will be marked as cancelled and
              can be deleted afterward.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading} className='text-white hover:text-white'>
            Keep Event
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleCancel}
            disabled={loading}>
            {loading ? 'Cancelling...' : 'Cancel Event'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
