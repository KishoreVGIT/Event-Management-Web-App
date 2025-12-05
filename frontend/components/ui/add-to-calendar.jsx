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
    <div className="relative inline-block">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
        variant="outline"
      >
        <Calendar className="w-4 h-4" />
        Add to Calendar
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg z-20 border border-gray-200 dark:border-gray-700">
            <div className="py-1">
              <button
                onClick={handleGoogleCalendar}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12,2C6.5,2,2,6.5,2,12s4.5,10,10,10s10-4.5,10-10S17.5,2,12,2z M13,17h-2v-6h2V17z M13,9h-2V7h2V9z"
                  />
                </svg>
                Google Calendar
              </button>

              <button
                onClick={handleOutlookCalendar}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M7,2H17A2,2,0,0,1,19,4V20A2,2,0,0,1,17,22H7A2,2,0,0,1,5,20V4A2,2,0,0,1,7,2M7,4V8H17V4H7M7,10V20H17V10H7Z"
                  />
                </svg>
                Outlook Calendar
              </button>

              <button
                onClick={handleYahooCalendar}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"
                  />
                </svg>
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
