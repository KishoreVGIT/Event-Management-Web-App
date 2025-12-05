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

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);

    try {
      const token = getToken();
      const response = await fetch(
        `${API_URL}/api/events`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (response.ok) {
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
