'use client';

import { useState, useEffect } from 'react';

interface ShowCountdownProps {
  startDate: string;
  startTime?: string | null;
}

function parseShowDate(startDate: string, startTime?: string | null): Date {
  const date = new Date(startDate + 'T00:00:00');
  if (startTime) {
    const match = startTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (match) {
      let hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      const period = match[3].toUpperCase();
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      date.setHours(hours, minutes, 0, 0);
    }
  }
  return date;
}

export function ShowCountdown({ startDate, startTime }: ShowCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    function update() {
      const target = parseShowDate(startDate, startTime);
      const now = new Date();
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        setIsLive(true);
        setTimeLeft(null);
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startDate, startTime]);

  if (isLive) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-green-500/10 border border-green-500/20 px-4 py-2 text-green-600 dark:text-green-400 text-sm font-medium">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
        Happening Now
      </div>
    );
  }

  if (!timeLeft) return null;

  return (
    <div className="flex gap-3">
      {[
        { value: timeLeft.days, label: 'days' },
        { value: timeLeft.hours, label: 'hrs' },
        { value: timeLeft.minutes, label: 'min' },
        { value: timeLeft.seconds, label: 'sec' },
      ].map(({ value, label }) => (
        <div key={label} className="text-center">
          <div className="text-2xl font-bold tabular-nums text-primary">
            {String(value).padStart(2, '0')}
          </div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      ))}
    </div>
  );
}
