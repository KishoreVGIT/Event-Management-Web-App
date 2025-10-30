"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DateTimePicker({
  value,
  onChange,
  label = "Date & Time",
  error
}) {
  const [open, setOpen] = React.useState(false)

  // Parse the datetime value
  const dateValue = value ? new Date(value) : undefined
  const timeValue = value
    ? new Date(value).toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      })
    : ""

  const handleDateSelect = (selectedDate) => {
    if (!selectedDate) return

    // If we have an existing time, preserve it
    let newDate = new Date(selectedDate)
    if (value) {
      const existingDate = new Date(value)
      newDate.setHours(existingDate.getHours())
      newDate.setMinutes(existingDate.getMinutes())
    }

    onChange(newDate.toISOString())
    setOpen(false)
  }

  const handleTimeChange = (e) => {
    const timeString = e.target.value
    if (!timeString) return

    // Use existing date or today's date
    const baseDate = value ? new Date(value) : new Date()
    const [hours, minutes] = timeString.split(':')
    baseDate.setHours(parseInt(hours, 10))
    baseDate.setMinutes(parseInt(minutes, 10))
    baseDate.setSeconds(0)

    onChange(baseDate.toISOString())
  }

  return (
    <div className="space-y-2">
      {label && (
        <Label className="text-sm font-medium">{label}</Label>
      )}
      <div className="flex gap-4">
        <div className="flex-1">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between font-normal">
                {dateValue ? dateValue.toLocaleDateString() : "Select date"}
                <ChevronDownIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
              <Calendar
                mode="single"
                selected={dateValue}
                captionLayout="dropdown"
                onSelect={handleDateSelect}
                fromYear={new Date().getFullYear()}
                toYear={new Date().getFullYear() + 10}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex-1">
          <Input
            type="time"
            value={timeValue}
            onChange={handleTimeChange}
            className="bg-background"
          />
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}
