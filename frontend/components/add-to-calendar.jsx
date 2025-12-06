'use client';

import { useState } from 'react';
import { Calendar, ChevronDown, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  downloadICalFile,
  generateGoogleCalendarUrl,
} from '@/lib/calendar-export';

export function AddToCalendar({ event }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadICS = async () => {
    if (isDownloading) return;

    setIsDownloading(true);
    try {
      await downloadICalFile(event);
    } catch (error) {
      console.error('Failed to download calendar file:', error);
      alert('Failed to download calendar file. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleGoogleCalendar = () => {
    const url = generateGoogleCalendarUrl(event);
    window.open(url, '_blank');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex w-full items-center justify-between gap-2 border-slate-700 bg-slate-900/50 text-slate-200 hover:bg-slate-800 hover:text-white"
        >
          <span className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Add to Calendar
          </span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="top"
        align="end"
        sideOffset={8}
        className="w-56 bg-slate-950 border-slate-800 text-slate-200"
      >
        <DropdownMenuLabel className="text-slate-400">Select calendar</DropdownMenuLabel>

        <DropdownMenuItem
          onClick={handleGoogleCalendar}
          className="text-sm focus:bg-slate-800 focus:text-white cursor-pointer"
        >
          Google Calendar
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-slate-800" />

        <DropdownMenuItem
          onClick={handleDownloadICS}
          disabled={isDownloading}
          className={`flex items-center gap-2 text-sm focus:bg-slate-800 focus:text-white cursor-pointer ${
            isDownloading ? 'opacity-60 cursor-not-allowed' : ''
          }`}
        >
          <Download className="w-4 h-4" />
          {isDownloading ? 'Downloading…' : 'Download .ics file'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
