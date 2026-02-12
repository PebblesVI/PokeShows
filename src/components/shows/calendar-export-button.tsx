'use client';

import { useState, useRef, useEffect } from 'react';
import { CalendarPlus, ChevronDown } from 'lucide-react';
import { generateICS, generateGoogleCalendarUrl } from '@/lib/calendar';
import type { Show } from '@/types/show';

export function CalendarExportButton({ show, size = 'icon' }: { show: Show; size?: 'icon' | 'default' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGoogleCalendar = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(generateGoogleCalendarUrl(show), '_blank');
    setOpen(false);
  };

  const handleICS = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = generateICS(show);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${show.slug}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setOpen(false);
  };

  if (size === 'default') {
    return (
      <div className="relative" ref={ref}>
        <button
          onClick={(e) => { e.preventDefault(); setOpen(!open); }}
          className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <CalendarPlus className="h-4 w-4" />
          Add to Calendar
          <ChevronDown className="h-3 w-3" />
        </button>
        {open && (
          <div className="absolute top-full mt-1 right-0 z-50 w-52 rounded-lg border border-border bg-background shadow-lg py-1">
            <button onClick={handleGoogleCalendar} className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors">
              Add to Google Calendar
            </button>
            <button onClick={handleICS} className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors">
              Download .ics file
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(!open); }}
        className="p-1.5 rounded-full hover:bg-accent/20 transition-colors"
        aria-label="Add to calendar"
      >
        <CalendarPlus className="h-4 w-4 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute top-full mt-1 right-0 z-50 w-52 rounded-lg border border-border bg-background shadow-lg py-1">
          <button onClick={handleGoogleCalendar} className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors">
            Add to Google Calendar
          </button>
          <button onClick={handleICS} className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors">
            Download .ics file
          </button>
        </div>
      )}
    </div>
  );
}
