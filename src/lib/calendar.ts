import type { Show } from '@/types/show';

/**
 * Formats a date and optional time into an ICS DTSTART/DTEND value.
 * If time is provided, returns "YYYYMMDDTHHMMSS", otherwise "YYYYMMDD" (all-day).
 */
function toICSDate(date: string, time?: string | null): string {
  const [year, month, day] = date.split('-');
  if (time) {
    // Parse times like "10:00 AM", "5:00 PM", "14:00"
    const cleaned = time.trim();
    let hours: number;
    let minutes: number;

    const match12 = cleaned.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (match12) {
      hours = parseInt(match12[1], 10);
      minutes = parseInt(match12[2], 10);
      const period = match12[3].toUpperCase();
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
    } else {
      const match24 = cleaned.match(/^(\d{1,2}):(\d{2})$/);
      if (match24) {
        hours = parseInt(match24[1], 10);
        minutes = parseInt(match24[2], 10);
      } else {
        return `${year}${month}${day}`;
      }
    }

    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    return `${year}${month}${day}T${hh}${mm}00`;
  }
  return `${year}${month}${day}`;
}

/**
 * Builds a full location string from show fields.
 */
function buildLocation(show: Show): string {
  const parts: string[] = [];
  if (show.venueName) parts.push(show.venueName);
  if (show.address) parts.push(show.address);
  parts.push(`${show.city}, ${show.state}`);
  if (show.zipCode) parts.push(show.zipCode);
  return parts.join(', ');
}

/**
 * Generates an ICS (iCalendar) file content and returns a blob URL for download.
 */
export function generateICS(show: Show): string {
  const dtStart = toICSDate(show.startDate, show.startTime);
  const dtEnd = show.endDate
    ? toICSDate(show.endDate, show.endTime)
    : show.endTime
      ? toICSDate(show.startDate, show.endTime)
      : dtStart;

  const isAllDay = !dtStart.includes('T');
  const location = buildLocation(show);
  const description = show.description
    ? show.description.replace(/\n/g, '\\n')
    : `${show.name} in ${show.city}, ${show.state}`;

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PokeShows//Calendar Export//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTART${isAllDay ? ';VALUE=DATE' : ''}:${dtStart}`,
    `DTEND${isAllDay ? ';VALUE=DATE' : ''}:${dtEnd}`,
    `SUMMARY:${show.name}`,
    `LOCATION:${location}`,
    `DESCRIPTION:${description}`,
    ...(show.websiteUrl ? [`URL:${show.websiteUrl}`] : []),
    `UID:${show.slug}@pokeshows.com`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  const content = lines.join('\r\n');
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  return URL.createObjectURL(blob);
}

/**
 * Generates a Google Calendar URL for the given show.
 */
export function generateGoogleCalendarUrl(show: Show): string {
  const dtStart = toICSDate(show.startDate, show.startTime);
  const dtEnd = show.endDate
    ? toICSDate(show.endDate, show.endTime)
    : show.endTime
      ? toICSDate(show.startDate, show.endTime)
      : dtStart;

  const location = buildLocation(show);
  const details = show.description || `${show.name} in ${show.city}, ${show.state}`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: show.name,
    dates: `${dtStart}/${dtEnd}`,
    location,
    details: show.websiteUrl ? `${details}\n\n${show.websiteUrl}` : details,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
