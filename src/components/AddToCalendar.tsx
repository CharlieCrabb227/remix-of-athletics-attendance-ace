
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { GameWithAttendance } from '@/types';

interface AddToCalendarProps {
  game: GameWithAttendance;
}

const AddToCalendar = ({ game }: AddToCalendarProps) => {
  const handleAddToCalendar = () => {
    // Format start and end time (assuming games are 1 hour long)
    const startDate = parseISO(`${game.date}T${game.time}`);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Add 1 hour

    // Create calendar event content
    const event = {
      BEGIN: 'VCALENDAR',
      VERSION: '2.0',
      BEGIN_EVENT: 'VEVENT',
      DTSTART: format(startDate, "yyyyMMdd'T'HHmmss"),
      DTEND: format(endDate, "yyyyMMdd'T'HHmmss"),
      SUMMARY: `Game vs ${game.opponent}`,
      DESCRIPTION: `${game.notes || ''}\nLocation: ${game.fieldName}`,
      LOCATION: game.fieldName,
      END_EVENT: 'VEVENT',
      END: 'VCALENDAR'
    };

    // Format the event data as an iCal string
    const icalContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${event.DTSTART}
DTEND:${event.DTEND}
SUMMARY:${event.SUMMARY}
DESCRIPTION:${event.DESCRIPTION}
LOCATION:${event.LOCATION}
END:VEVENT
END:VCALENDAR`;

    // Create and download the .ics file
    const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `game-${format(startDate, 'yyyy-MM-dd')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full sm:w-auto"
      onClick={handleAddToCalendar}
    >
      <CalendarIcon className="h-4 w-4 mr-2" />
      Add to Calendar
    </Button>
  );
};

export default AddToCalendar;
