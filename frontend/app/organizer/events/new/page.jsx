'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

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
    .test('is-after-start', 'End date/time must be after start date/time', function(value) {
      const { startDate } = this.parent;
      if (!value || !startDate) return true; // Skip if either is null
      return new Date(value) > new Date(startDate);
    }),
  capacity: yup
    .number()
    .nullable()
    .transform((value, originalValue) =>
      originalValue === '' ? null : value
    )
    .positive('Capacity must be a positive number')
    .integer('Capacity must be a whole number'),
  location: yup.string().max(500, 'Location must be less than 500 characters'),
  category: yup.string().max(100, 'Category must be less than 100 characters'),
  imageUrl: yup.string().url('Must be a valid URL'),
});

export default function NewEventPage() {
  const router = useRouter();
  const { user, loading: authLoading, getToken } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [useTimeSlots, setUseTimeSlots] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(eventSchema),
  });

  const imageUrl = watch('imageUrl');
  const startDate = watch('startDate');
  const endDate = watch('endDate');

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/signin');
      } else if (user.role !== 'organizer' && user.role !== 'admin') {
        toast.error('You must be an organizer to create events');
        router.push('/events');
      }
    }
  }, [user, authLoading]);

  // Generate time slots when dates change and feature is enabled
  useEffect(() => {
    if (useTimeSlots && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Check if event spans multiple days
      const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
      const daysDiff = Math.ceil((endDay - startDay) / (1000 * 60 * 60 * 24));

      if (daysDiff > 0) {
        // Generate slots for each day
        const slots = [];
        for (let i = 0; i <= daysDiff; i++) {
          const currentDay = new Date(startDay);
          currentDay.setDate(startDay.getDate() + i);

          const dateStr = currentDay.toISOString().split('T')[0];
          const existingSlot = timeSlots.find(s => s.date === dateStr);

          slots.push({
            date: dateStr,
            startTime: existingSlot?.startTime || '09:00',
            endTime: existingSlot?.endTime || '17:00',
          });
        }
        setTimeSlots(slots);
      } else {
        // Single day event, disable time slots
        setUseTimeSlots(false);
        setTimeSlots([]);
      }
    }
  }, [useTimeSlots, startDate, endDate]);

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);

    try {
      const token = getToken();
      const payload = {
        ...data,
        ...(useTimeSlots && timeSlots.length > 0 && { timeSlots }),
      };

      const response = await fetch(
        `${API_URL}/api/events`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast.success('Event created successfully!');
        router.push('/organizer/dashboard');
      } else {
        setError(result.error || 'Failed to create event');
      }
    } catch (err) {
      setError('Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const updateTimeSlot = (index, field, value) => {
    const newSlots = [...timeSlots];
    newSlots[index][field] = value;
    setTimeSlots(newSlots);
  };

  const isMultiDay = startDate && endDate && (() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    return endDay > startDay;
  })();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Create New Event
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/organizer/dashboard">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-md">
                  {error}
                </div>
              )}

              <div>
                <FieldLabel htmlFor="title">Event Title *</FieldLabel>
                <Input
                  id="title"
                  type="text"
                  placeholder="Enter event title"
                  {...register('title')}
                />
                {errors.title && (
                  <FieldError>{errors.title.message}</FieldError>
                )}
              </div>

              <div>
                <FieldLabel htmlFor="description">
                  Description
                </FieldLabel>
                <Textarea
                  id="description"
                  placeholder="Enter event description"
                  rows={5}
                  {...register('description')}
                />
                {errors.description && (
                  <FieldError>
                    {errors.description.message}
                  </FieldError>
                )}
              </div>

              <Controller
                name="startDate"
                control={control}
                render={({ field: startField }) => (
                  <Controller
                    name="endDate"
                    control={control}
                    render={({ field: endField }) => (
                      <DateTimeRangePicker
                        label="Event Date & Time *"
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

              {/* Time Slots for Multi-Day Events */}
              {isMultiDay && (
                <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <FieldLabel>Different Times for Each Day</FieldLabel>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Specify different time ranges for each day of your multi-day event
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUseTimeSlots(!useTimeSlots)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        useTimeSlots ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          useTimeSlots ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {useTimeSlots && timeSlots.length > 0 && (
                    <div className="space-y-3 mt-4">
                      {timeSlots.map((slot, index) => (
                        <div key={slot.date} className="grid grid-cols-3 gap-3 p-3 bg-white dark:bg-gray-900 rounded-md">
                          <div>
                            <FieldLabel className="text-xs">Date</FieldLabel>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
                              {new Date(slot.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </div>
                          </div>
                          <div>
                            <FieldLabel htmlFor={`slot-start-${index}`} className="text-xs">Start Time</FieldLabel>
                            <Input
                              id={`slot-start-${index}`}
                              type="time"
                              value={slot.startTime}
                              onChange={(e) => updateTimeSlot(index, 'startTime', e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <FieldLabel htmlFor={`slot-end-${index}`} className="text-xs">End Time</FieldLabel>
                            <Input
                              id={`slot-end-${index}`}
                              type="time"
                              value={slot.endTime}
                              onChange={(e) => updateTimeSlot(index, 'endTime', e.target.value)}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div>
                <FieldLabel htmlFor="location">
                  Location/Venue
                </FieldLabel>
                <Input
                  id="location"
                  type="text"
                  placeholder="Enter event location"
                  {...register('location')}
                />
                {errors.location && (
                  <FieldError>{errors.location.message}</FieldError>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel htmlFor="capacity">
                    Capacity (Optional)
                  </FieldLabel>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    placeholder="Max attendees"
                    {...register('capacity')}
                  />
                  {errors.capacity && (
                    <FieldError>{errors.capacity.message}</FieldError>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty for unlimited capacity
                  </p>
                </div>

                <div>
                  <FieldLabel htmlFor="category">
                    Category (Optional)
                  </FieldLabel>
                  <Input
                    id="category"
                    type="text"
                    placeholder="e.g., Workshop, Social"
                    {...register('category')}
                  />
                  {errors.category && (
                    <FieldError>{errors.category.message}</FieldError>
                  )}
                </div>
              </div>

              <div>
                <FieldLabel htmlFor="imageUrl">
                  Event Image (Optional)
                </FieldLabel>
                <ImageUpload
                  value={imageUrl || ''}
                  onChange={(url) => setValue('imageUrl', url)}
                  disabled={loading}
                />
                {errors.imageUrl && (
                  <FieldError>{errors.imageUrl.message}</FieldError>
                )}
              </div>

              <div className="flex space-x-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1">
                  {loading ? 'Creating...' : 'Create Event'}
                </Button>
                <Link href="/organizer/dashboard" className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full">
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
