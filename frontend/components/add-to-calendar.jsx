'use client';

import { useState } from 'react';
import { Calendar, ChevronDown, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  downloadICalFile,
  generateGoogleCalendarUrl,
  generateOutlookCalendarUrl,
  generateYahooCalendarUrl,
} from '@/lib/calendar-export';

export function AddToCalendar({ event }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadICS = async () => {
    setIsDownloading(true);
    try {
      await downloadICalFile(event);
    } catch (error) {
      console.error('Failed to download calendar file:', error);
      alert('Failed to download calendar file. Please try again.');
    } finally {
      setIsDownloading(false);
      setIsOpen(false);
    }
  };

  const handleGoogleCalendar = () => {
    const url = generateGoogleCalendarUrl(event);
    window.open(url, '_blank');
    setIsOpen(false);
  };

  const handleOutlookCalendar = () => {
    const url = generateOutlookCalendarUrl(event);
    window.open(url, '_blank');
    setIsOpen(false);
  };

  const handleYahooCalendar = () => {
    const url = generateYahooCalendarUrl(event);
    window.open(url, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block w-full">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-2"
        variant="outline"
      >
        <span className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Add to Calendar
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Menu (opens upward now) */}
          <div className="absolute right-0 bottom-full mb-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700">
            <div className="py-1">
              <button
                onClick={handleGoogleCalendar}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
              >
                Google Calendar
              </button>

              <button
                onClick={handleOutlookCalendar}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
              >
                Outlook Calendar
              </button>

              <button
                onClick={handleYahooCalendar}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
              >
                Yahoo Calendar
              </button>

              <div className="border-t border-gray-200 dark:border-gray-700 my-1" />

              <button
                onClick={handleDownloadICS}
                disabled={isDownloading}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                {isDownloading ? 'Downloading...' : 'Download .ics file'}
              </button>

              <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
                Works with Apple Calendar, Outlook, and more
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
