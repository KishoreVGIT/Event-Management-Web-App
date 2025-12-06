'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FieldLabel, FieldError } from '@/components/ui/field';
import { DateTimeRangePicker } from '@/components/ui/date-time-range-picker';
import { ImageUpload } from '@/components/ui/image-upload';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { API_URL } from '@/lib/constants';

const eventSchema = yup.object().shape({
  title: yup
    .string()
    .required('Title is required')
    .min(3, 'Title must be at least 3 characters'),
  description: yup.string(),
  startDate: yup.string().required('Start date is required'),
  endDate: yup
    .string()
    .nullable()
    .test(
      'is-after-start',
      'End date/time must be after start date/time',
      function (value) {
        const { startDate } = this.parent;
        if (!value || !startDate) return true;
        return new Date(value) > new Date(startDate);
      }
    ),
  capacity: yup
    .number()
    .nullable()
    .transform((value, originalValue) =>
      originalValue === '' ? null : value
    )
    .positive('Capacity must be a positive number')
    .integer('Capacity must be a whole number'),
  location: yup
    .string()
    .max(500, 'Location must be less than 500 characters'),
  category: yup
    .string()
    .max(100, 'Category must be less than 100 characters'),
  imageUrl: yup
    .string()
    .nullable()
    .transform((value, originalValue) =>
      originalValue === '' ? null : originalValue
    )
    .url('Must be a valid URL')
    .notRequired(),
});

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading, getToken } = useAuth();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingEvent, setFetchingEvent] = useState(true);

  const eventId = useMemo(() => {
    const id = params?.id;
    return Array.isArray(id) ? id[0] : id;
  }, [params]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      capacity: '',
      location: '',
      category: '',
      imageUrl: '',
    },
  });

  const imageUrl = watch('imageUrl');

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      toast.error('Please sign in to edit events.');
      router.push('/signin');
      return;
    }

    if (user.role !== 'organizer' && user.role !== 'admin') {
      toast.error('You must be an organizer to edit events.');
      router.push('/events');
      return;
    }

    if (eventId) {
      fetchEvent();
    } else {
      setFetchingEvent(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, eventId]);

  const fetchEvent = async () => {
    setFetchingEvent(true);
    try {
      const response = await fetch(
        `${API_URL}/api/events/${eventId}`,
        {
          cache: 'no-store',
        }
      );

      if (!response.ok) {
        toast.error('Event not found.');
        router.push('/organizer/dashboard');
        return;
      }

      const data = await response.json();

      if (
        user.role !== 'admin' &&
        data.userId?.toString() !== user.id?.toString()
      ) {
        toast.error('You can only edit your own events.');
        router.push('/organizer/dashboard');
        return;
      }

      setValue('title', data.title || '');
      setValue('description', data.description || '');
      setValue('location', data.location || '');
      setValue(
        'capacity',
        typeof data.capacity === 'number' ? data.capacity : ''
      );
      setValue('category', data.category || '');
      setValue('imageUrl', data.imageUrl || '');

      if (data.startDate) {
        setValue('startDate', new Date(data.startDate).toISOString());
      }
      if (data.endDate) {
        setValue('endDate', new Date(data.endDate).toISOString());
      }
    } catch (err) {
      console.error('Error fetching event:', err);
      toast.error('Failed to load event. Please try again.');
      router.push('/organizer/dashboard');
    } finally {
      setFetchingEvent(false);
    }
  };

  const onSubmit = async (formData) => {
    setError('');
    setLoading(true);

    try {
      const token = getToken();
      if (!token) {
        toast.error('Authentication error. Please sign in again.');
        setLoading(false);
        router.push('/signin');
        return;
      }

      const response = await fetch(
        `${API_URL}/api/events/${eventId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(result.error || 'Failed to update event');
        return;
      }

      toast.success('Event updated successfully.');
      router.push('/organizer/dashboard');
    } catch (err) {
      console.error('Error updating event:', err);
      setError('Failed to update event');
      toast.error('Failed to update event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || fetchingEvent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 flex items-center justify-center">
        <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10" />
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-full border-4 border-slate-700 border-t-blue-500 animate-spin" />
          <p className="text-sm font-medium text-slate-300">
            Loading event…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      {/* Subtle grid background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10" />

      {/* Top nav */}
      <nav className="bg-slate-950/80 border-b border-slate-800/70 backdrop-blur-xl shadow-2xl shadow-blue-900/10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-50">
              Edit event
            </h1>
            <Link href="/organizer/dashboard">
              <Button className="bg-slate-800/80 text-slate-200 hover:bg-slate-800 hover:text-slate-50 border-slate-700 rounded-full text-sm">
                Back to dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-slate-950/85 border-slate-800/80 backdrop-blur-2xl shadow-2xl shadow-blue-900/20 rounded-2xl pt-6">
          <CardHeader className="border-b border-slate-800/70 pb-4">
            <CardTitle className="text-slate-50 text-lg">
              Event details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-7">
              {error && (
                <div className="p-3 text-xs sm:text-sm text-red-300 bg-red-500/10 border border-red-500/40 rounded-xl">
                  {error}
                </div>
              )}

              {/* Title */}
              <div className="space-y-1.5">
                <FieldLabel
                  htmlFor="title"
                  className="text-slate-200 text-sm">
                  Event title *
                </FieldLabel>
                <Input
                  id="title"
                  type="text"
                  placeholder="Enter event title"
                  className="h-11 bg-slate-900/80 border-slate-800/80 text-slate-100 placeholder:text-slate-500 rounded-xl focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/25"
                  {...register('title')}
                />
                {errors.title && (
                  <FieldError>{errors.title.message}</FieldError>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <FieldLabel
                  htmlFor="description"
                  className="text-slate-200 text-sm">
                  Description
                </FieldLabel>
                <Textarea
                  id="description"
                  placeholder="Describe what this event is about"
                  rows={5}
                  className="bg-slate-900/80 border-slate-800/80 text-slate-100 placeholder:text-slate-500 rounded-xl focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/25"
                  {...register('description')}
                />
                {errors.description && (
                  <FieldError>
                    {errors.description.message}
                  </FieldError>
                )}
              </div>

              <div className="space-y-1.5">
                <FieldLabel className="text-slate-200 text-sm">
                  Event date &amp; time *
                </FieldLabel>
                <p className="text-xs text-slate-400 mb-1">
                  Choose a start time. Optionally select an end time
                  or span multiple days if this is a multi-day event.
                </p>

                <div className="rounded-xl border border-slate-800/80 bg-slate-900/80 px-3 py-3 sm:px-4 sm:py-4">
                  <Controller
                    name="startDate"
                    control={control}
                    render={({ field: startField }) => (
                      <Controller
                        name="endDate"
                        control={control}
                        render={({ field: endField }) => (
                          <DateTimeRangePicker
                            startValue={startField.value}
                            endValue={endField.value}
                            onStartChange={startField.onChange}
                            onEndChange={endField.onChange}
                            startError={errors.startDate?.message}
                            endError={errors.endDate?.message}
                          />
                        )}
                      />
                    )}
                  />
                </div>

                {(errors.startDate || errors.endDate) && (
                  <div className="mt-1 space-y-0.5">
                    {errors.startDate?.message && (
                      <FieldError>
                        {errors.startDate.message}
                      </FieldError>
                    )}
                    {errors.endDate?.message && (
                      <FieldError>
                        {errors.endDate.message}
                      </FieldError>
                    )}
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <FieldLabel
                  htmlFor="location"
                  className="text-slate-200 text-sm">
                  Location / venue
                </FieldLabel>
                <Input
                  id="location"
                  type="text"
                  placeholder="Enter event location"
                  className="h-11 bg-slate-900/80 border-slate-800/80 text-slate-100 placeholder:text-slate-500 rounded-xl focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/25"
                  {...register('location')}
                />
                {errors.location && (
                  <FieldError>{errors.location.message}</FieldError>
                )}
              </div>

              {/* Capacity + Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <FieldLabel
                    htmlFor="capacity"
                    className="text-slate-200 text-sm">
                    Capacity (optional)
                  </FieldLabel>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    placeholder="Max attendees"
                    className="h-11 bg-slate-900/80 border-slate-800/80 text-slate-100 placeholder:text-slate-500 rounded-xl focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/25"
                    {...register('capacity')}
                  />
                  {errors.capacity && (
                    <FieldError>{errors.capacity.message}</FieldError>
                  )}
                  <p className="text-[11px] text-slate-400">
                    Leave empty for unlimited capacity.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <FieldLabel
                    htmlFor="category"
                    className="text-slate-200 text-sm">
                    Category (optional)
                  </FieldLabel>
                  <Input
                    id="category"
                    type="text"
                    placeholder="e.g. Workshop, Social"
                    className="h-11 bg-slate-900/80 border-slate-800/80 text-slate-100 placeholder:text-slate-500 rounded-xl focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/25"
                    {...register('category')}
                  />
                  {errors.category && (
                    <FieldError>{errors.category.message}</FieldError>
                  )}
                </div>
              </div>

              {/* Image */}
              <div className="space-y-1.5">
                <FieldLabel
                  htmlFor="imageUrl"
                  className="text-slate-200 text-sm">
                  Event image (optional)
                </FieldLabel>
                <p className="text-[11px] text-slate-400 mb-1">
                  Upload or paste a URL for the event cover image.
                </p>
                <ImageUpload
                  value={imageUrl || ''}
                  onChange={(url) => setValue('imageUrl', url)}
                  disabled={loading}
                />
                {errors.imageUrl && (
                  <FieldError>{errors.imageUrl.message}</FieldError>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-500/25 text-sm h-11">
                  {loading ? 'Updating…' : 'Update event'}
                </Button>
                <Link href="/organizer/dashboard" className="flex-1">
                  <Button
                    type="button"
                    className="w-full bg-slate-800/80 text-slate-200 hover:bg-slate-800 border-slate-700 rounded-full text-sm h-11">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
