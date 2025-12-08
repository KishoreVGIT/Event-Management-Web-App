'use client';

import * as React from 'react';
import { ChevronDownIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function DateTimeRangePicker({
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  startError,
  endError,
  label = 'Event Date & Time',
  timeDisabled = false,
}) {
  const [open, setOpen] = React.useState(false);
  const [endDateOpen, setEndDateOpen] = React.useState(false);
  const [isMultiDay, setIsMultiDay] = React.useState(false);

  // Memoized parsed dates
  const startDate = React.useMemo(
    () => (startValue ? new Date(startValue) : undefined),
    [startValue]
  );
  const endDate = React.useMemo(
    () => (endValue ? new Date(endValue) : undefined),
    [endValue]
  );

  // Extract time values
  const startTime = React.useMemo(
    () =>
      startValue
        ? new Date(startValue).toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
          })
        : '',
    [startValue]
  );

  const endTime = React.useMemo(
    () =>
      endValue
        ? new Date(endValue).toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
          })
        : '',
    [endValue]
  );

  // Auto-detect multi-day when end date is later than start date
  React.useEffect(() => {
    if (startValue && endValue) {
      const start = new Date(startValue);
      const end = new Date(endValue);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      if (end > start && !isMultiDay) {
        setIsMultiDay(true);
      }
      if (end.getTime() === start.getTime() && isMultiDay) {
        setIsMultiDay(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startValue, endValue]);

  const handleStartDateSelect = (selectedDate) => {
    if (!selectedDate) return;

    const newDate = new Date(selectedDate);

    // Preserve existing time if available
    if (startValue) {
      const existingDate = new Date(startValue);
      newDate.setHours(existingDate.getHours());
      newDate.setMinutes(existingDate.getMinutes());
    } else {
      // Default to current time
      const now = new Date();
      newDate.setHours(now.getHours());
      newDate.setMinutes(now.getMinutes());
    }

    onStartChange(newDate.toISOString());

    // If not multi-day and no end time set, default end to +1 hour same day
    if (!isMultiDay && !endValue) {
      const endDateTime = new Date(newDate);
      const proposedEndHour = newDate.getHours() + 1;

      if (proposedEndHour >= 24) {
        endDateTime.setHours(23, 59, 0, 0);
      } else {
        endDateTime.setHours(proposedEndHour);
      }

      onEndChange(endDateTime.toISOString());
    }

    setOpen(false);
  };

  const handleEndDateSelect = (selectedDate) => {
    if (!selectedDate) return;

    const newDate = new Date(selectedDate);

    // Preserve existing time if available
    if (endValue) {
      const existingDate = new Date(endValue);
      newDate.setHours(existingDate.getHours());
      newDate.setMinutes(existingDate.getMinutes());
    } else {
      // Default to end of day
      newDate.setHours(23, 59, 0, 0);
    }

    onEndChange(newDate.toISOString());
    setEndDateOpen(false);
  };

  const handleStartTimeChange = (e) => {
    const timeString = e.target.value;
    if (!timeString) return;

    const baseDate = startValue ? new Date(startValue) : new Date();
    const [hours, minutes] = timeString.split(':');
    baseDate.setHours(parseInt(hours, 10));
    baseDate.setMinutes(parseInt(minutes, 10));
    baseDate.setSeconds(0);

    onStartChange(baseDate.toISOString());
  };

  const handleEndTimeChange = (e) => {
    const timeString = e.target.value;
    if (!timeString) return;

    let baseDate;
    if (isMultiDay && endValue) {
      baseDate = new Date(endValue);
    } else if (startValue) {
      baseDate = new Date(startValue);
    } else {
      baseDate = new Date();
    }

    const [hours, minutes] = timeString.split(':');
    baseDate.setHours(parseInt(hours, 10));
    baseDate.setMinutes(parseInt(minutes, 10));
    baseDate.setSeconds(0);

    onEndChange(baseDate.toISOString());
  };

  const handleMultiDayToggle = (checked) => {
    const value = Boolean(checked);
    setIsMultiDay(value);

    if (!value && startValue) {
      // Reset end date to same day as start date
      const start = new Date(startValue);
      const end = endValue ? new Date(endValue) : new Date(start);

      const newEndDate = new Date(start);
      newEndDate.setHours(end.getHours());
      newEndDate.setMinutes(end.getMinutes());
      newEndDate.setSeconds(0);

      onEndChange(newEndDate.toISOString());
    } else if (value && startValue) {
      // If toggling on, allow multi-day
      const start = new Date(startValue);
      const end = endValue ? new Date(endValue) : new Date(start);

      const startDay = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate()
      );
      const endDay = new Date(
        end.getFullYear(),
        end.getMonth(),
        end.getDate()
      );

      // If end date is same as start date (or before), move it to next day
      // This ensures parent components detect it as multi-day immediately
      if (endDay.getTime() <= startDay.getTime()) {
        const newEnd = new Date(end);
        newEnd.setDate(newEnd.getDate() + 1);
        onEndChange(newEnd.toISOString());
      }
    }
  };

  return (
    <div className="space-y-4 text-slate-100">
      {label && (
        <Label className="text-sm font-medium text-slate-100">
          {label}
        </Label>
      )}

      {/* Date and Start/End Time Row */}
      <div className="flex flex-col gap-4 md:flex-row">
        {/* Date Picker */}
        <div className="flex-1">
          <Label
            htmlFor="event-date"
            className="text-xs font-medium mb-1.5 block text-slate-300">
            Date
          </Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="event-date"
                className="w-full justify-between font-normal bg-slate-900/80 border-slate-700/80 text-slate-100 hover:text-slate-200 hover:bg-slate-900 hover:border-slate-500">
                {startDate
                  ? startDate.toLocaleDateString()
                  : 'Select date'}
                <ChevronDownIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0 bg-slate-950 border-slate-800"
              align="start">
              <Calendar
                mode="single"
                selected={startDate}
                captionLayout="dropdown"
                onSelect={handleStartDateSelect}
                fromYear={new Date().getFullYear()}
                toYear={new Date().getFullYear() + 10}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Start Time */}
        <div className="flex-1">
          <Label
            htmlFor="start-time"
            className="text-xs font-medium mb-1.5 block text-slate-300">
            Start time
          </Label>
          <Input
            type="time"
            id="start-time"
            value={startTime}
            onChange={handleStartTimeChange}
            disabled={timeDisabled}
            className={`bg-slate-900/80 border-slate-800/80 text-slate-100 placeholder:text-slate-500 rounded-full focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/25 p-6 ${
              timeDisabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          />
        </div>

        {/* End Time */}
        <div className="flex-1">
          <Label
            htmlFor="end-time"
            className="text-xs font-medium mb-1.5 block text-slate-300">
            End time
          </Label>
          <Input
            type="time"
            id="end-time"
            value={endTime}
            onChange={handleEndTimeChange}
            disabled={timeDisabled}
            className={`bg-slate-900/80 border-slate-800/80 text-slate-100 placeholder:text-slate-500 rounded-full focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/25 p-6 ${
              timeDisabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          />
        </div>
      </div>

      {/* Errors for start / end when same-day */}
      {startError && (
        <p className="text-xs text-red-400 mt-1">{startError}</p>
      )}

      {endError && !isMultiDay && (
        <p className="text-xs text-red-400 mt-1">{endError}</p>
      )}

      {/* Multi-day Event Toggle */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="multi-day"
          checked={isMultiDay}
          onCheckedChange={handleMultiDayToggle}
        />
        <label
          htmlFor="multi-day"
          className="text-sm font-medium leading-none text-slate-200 cursor-pointer">
          Event spans multiple days
        </label>
      </div>

      {/* End Date (only shown for multi-day events) */}
      {isMultiDay && (
        <div className="pl-4 md:pl-6 border-l border-slate-800/80 space-y-2">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <Label
                htmlFor="end-date"
                className="text-xs font-medium mb-1.5 block text-slate-300">
                End date
              </Label>
              <Popover
                open={endDateOpen}
                onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="end-date"
                    className="w-full justify-between font-normal bg-slate-900/80 border-slate-700/80 text-slate-100 hover:text-slate-200 hover:bg-slate-900 hover:border-slate-500">
                    {endDate
                      ? endDate.toLocaleDateString()
                      : 'Select end date'}
                    <ChevronDownIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto overflow-hidden p-0 bg-slate-950 border-slate-800"
                  align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    captionLayout="dropdown"
                    onSelect={handleEndDateSelect}
                    fromDate={startDate}
                    fromYear={new Date().getFullYear()}
                    toYear={new Date().getFullYear() + 10}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex-1">
              <Label className="text-xs font-medium mb-1.5 block text-slate-500">
                End time
              </Label>
              <Input
                type="time"
                value={endTime}
                onChange={handleEndTimeChange}
                className="bg-slate-900/60 border-slate-800/80 text-slate-400 rounded-full p-6"
                disabled
              />
            </div>
          </div>

          {endError && (
            <p className="text-xs text-red-400 mt-1.5">{endError}</p>
          )}
        </div>
      )}
    </div>
  );
}
