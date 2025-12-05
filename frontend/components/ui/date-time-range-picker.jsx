"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DateTimeRangePicker({
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  startError,
  endError,
  label = "Event Date & Time"
}) {
  const [open, setOpen] = React.useState(false)
  const [endDateOpen, setEndDateOpen] = React.useState(false)
  const [isMultiDay, setIsMultiDay] = React.useState(false)

  // Parse the datetime values
  const startDate = startValue ? new Date(startValue) : undefined
  const endDate = endValue ? new Date(endValue) : undefined

  // Extract time values
  const startTime = startValue
    ? new Date(startValue).toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      })
    : ""

  const endTime = endValue
    ? new Date(endValue).toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      })
    : ""

  // Check if end date is different from start date (multi-day event)
  React.useEffect(() => {
    if (startValue && endValue) {
      const start = new Date(startValue)
      const end = new Date(endValue)
      start.setHours(0, 0, 0, 0)
      end.setHours(0, 0, 0, 0)
      // Only auto-check if dates are different AND user hasn't manually toggled
      if (end > start) {
        setIsMultiDay(true)
      } else if (end.getTime() === start.getTime() && isMultiDay) {
        // Auto-uncheck if dates become the same
        setIsMultiDay(false)
      }
    }
  }, [startValue, endValue])

  const handleStartDateSelect = (selectedDate) => {
    if (!selectedDate) return

    let newDate = new Date(selectedDate)

    // Preserve existing time if available
    if (startValue) {
      const existingDate = new Date(startValue)
      newDate.setHours(existingDate.getHours())
      newDate.setMinutes(existingDate.getMinutes())
    } else {
      // Default to current time
      const now = new Date()
      newDate.setHours(now.getHours())
      newDate.setMinutes(now.getMinutes())
    }

    onStartChange(newDate.toISOString())

    // If not multi-day and no end time set, set end time to same day
    if (!isMultiDay && !endValue) {
      const endDateTime = new Date(newDate)
      const proposedEndHour = newDate.getHours() + 1

      // Make sure end time stays on same day
      if (proposedEndHour >= 24) {
        endDateTime.setHours(23, 59, 0, 0)
      } else {
        endDateTime.setHours(proposedEndHour)
      }

      onEndChange(endDateTime.toISOString())
    }

    setOpen(false)
  }

  const handleEndDateSelect = (selectedDate) => {
    if (!selectedDate) return

    let newDate = new Date(selectedDate)

    // Preserve existing time if available
    if (endValue) {
      const existingDate = new Date(endValue)
      newDate.setHours(existingDate.getHours())
      newDate.setMinutes(existingDate.getMinutes())
    } else {
      // Default to end of day
      newDate.setHours(23, 59, 0, 0)
    }

    onEndChange(newDate.toISOString())
    setEndDateOpen(false)
  }

  const handleStartTimeChange = (e) => {
    const timeString = e.target.value
    if (!timeString) return

    const baseDate = startValue ? new Date(startValue) : new Date()
    const [hours, minutes] = timeString.split(':')
    baseDate.setHours(parseInt(hours, 10))
    baseDate.setMinutes(parseInt(minutes, 10))
    baseDate.setSeconds(0)

    onStartChange(baseDate.toISOString())
  }

  const handleEndTimeChange = (e) => {
    const timeString = e.target.value
    if (!timeString) return

    // Use end date if multi-day, otherwise use start date
    let baseDate
    if (isMultiDay && endValue) {
      baseDate = new Date(endValue)
    } else if (startValue) {
      baseDate = new Date(startValue)
    } else {
      baseDate = new Date()
    }

    const [hours, minutes] = timeString.split(':')
    baseDate.setHours(parseInt(hours, 10))
    baseDate.setMinutes(parseInt(minutes, 10))
    baseDate.setSeconds(0)

    onEndChange(baseDate.toISOString())
  }

  const handleMultiDayToggle = (checked) => {
    setIsMultiDay(checked)

    if (!checked && startValue) {
      // Reset end date to same day as start date
      const start = new Date(startValue)
      const end = endValue ? new Date(endValue) : new Date(start)

      // Keep the end time but set to same day as start
      const newEndDate = new Date(start)
      newEndDate.setHours(end.getHours())
      newEndDate.setMinutes(end.getMinutes())

      onEndChange(newEndDate.toISOString())
    } else if (checked && startValue && !endValue) {
      // Set end date to next day
      const start = new Date(startValue)
      const end = new Date(start)
      end.setDate(end.getDate() + 1)
      onEndChange(end.toISOString())
    }
  }

  return (
    <div className="space-y-4">
      {label && (
        <Label className="text-sm font-medium">{label}</Label>
      )}

      {/* Date and Start/End Time Row */}
      <div className="flex gap-4">
        {/* Date Picker */}
        <div className="flex-1">
          <Label htmlFor="event-date" className="text-sm mb-2 block">Date</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="event-date"
                className="w-full justify-between font-normal">
                {startDate ? startDate.toLocaleDateString() : "Select date"}
                <ChevronDownIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
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
          <Label htmlFor="start-time" className="text-sm mb-2 block">Start Time</Label>
          <Input
            type="time"
            id="start-time"
            value={startTime}
            onChange={handleStartTimeChange}
            className="bg-background"
          />
        </div>

        {/* End Time */}
        <div className="flex-1">
          <Label htmlFor="end-time" className="text-sm mb-2 block">End Time</Label>
          <Input
            type="time"
            id="end-time"
            value={endTime}
            onChange={handleEndTimeChange}
            className="bg-background"
          />
        </div>
      </div>

      {startError && (
        <p className="text-sm text-red-600 dark:text-red-400">{startError}</p>
      )}

      {endError && !isMultiDay && (
        <p className="text-sm text-red-600 dark:text-red-400">{endError}</p>
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
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
        >
          Event spans multiple days
        </label>
      </div>

      {/* End Date (only shown for multi-day events) */}
      {isMultiDay && (
        <div className="pl-6 border-l-2 border-gray-200 dark:border-gray-700">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="end-date" className="text-sm mb-2 block">End Date</Label>
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="end-date"
                    className="w-full justify-between font-normal">
                    {endDate ? endDate.toLocaleDateString() : "Select end date"}
                    <ChevronDownIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
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
              <Label className="text-sm mb-2 block text-gray-400">End Time</Label>
              <Input
                type="time"
                value={endTime}
                onChange={handleEndTimeChange}
                className="bg-background"
                disabled
              />
            </div>
          </div>
          {endError && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-2">{endError}</p>
          )}
        </div>
      )}
    </div>
  )
}
