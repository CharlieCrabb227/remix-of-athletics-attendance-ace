
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { GameWithAttendance } from '@/types';
import { format, parseISO } from 'date-fns';

interface BulkCalendarActionsProps {
  games: GameWithAttendance[];
}

const BulkCalendarActions = ({ games }: BulkCalendarActionsProps) => {
  const handleBulkAddToCalendar = () => {
    // Create calendar events for all games
    const calendarEvents = games.map(game => {
      const startDate = parseISO(`${game.date}T${game.time}`);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Add 1 hour

      return `BEGIN:VEVENT
DTSTART:${format(startDate, "yyyyMMdd'T'HHmmss")}
DTEND:${format(endDate, "yyyyMMdd'T'HHmmss")}
SUMMARY:Game vs ${game.opponent}
DESCRIPTION:${game.notes || ''}\nLocation: ${game.fieldName}
LOCATION:${game.fieldName}
END:VEVENT`;
    }).join('\n');

    // Format the full iCal content
    const icalContent = `BEGIN:VCALENDAR
VERSION:2.0
${calendarEvents}
END:VCALENDAR`;

    // Create and download the .ics file
    const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `kanata-athletics-games.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="mb-4"
      onClick={handleBulkAddToCalendar}
    >
      <CalendarIcon className="h-4 w-4 mr-2" />
      Add All Games to Calendar
    </Button>
  );
};

export default BulkCalendarActions;
