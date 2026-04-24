import { useState } from 'react';
import { GameWithAttendance, ATTENDANCE_LABELS, AttendanceStatus } from '@/types';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Calendar, Clock, MapPin, Users, Beer, ChevronDown, ChevronUp } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import AddToCalendar from './AddToCalendar';

interface GameCardProps {
  game: GameWithAttendance;
}

const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const { user } = useAuth();
  const { updateAttendance, assignBeerDuty, unassignBeerDuty } = useData();
  const [isAttendanceUpdating, setIsAttendanceUpdating] = useState(false);
  const [isBeerDutyUpdating, setIsBeerDutyUpdating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const dateObj = parseISO(game.date);
  const attendanceCount = {
    yes: game.attendance.filter(a => a.status === 'yes').length,
    no: game.attendance.filter(a => a.status === 'no').length,
    maybe: game.attendance.filter(a => a.status === 'maybe').length,
  };
  
  const handleAttendanceUpdate = async (status: AttendanceStatus) => {
    if (!user) return;
    
    setIsAttendanceUpdating(true);
    try {
      await updateAttendance(game.id, status);
    } catch (err) {
      console.error('Failed to update attendance', err);
    } finally {
      setIsAttendanceUpdating(false);
    }
  };
  
  const handleBeerDuty = async () => {
    if (!user) return;
    
    setIsBeerDutyUpdating(true);
    try {
      if (game.beerDutyId) {
        if (game.beerDutyId === user.id || user.isAdmin) {
          await unassignBeerDuty(game.id);
        }
      } else {
        await assignBeerDuty(game.id);
      }
    } catch (err) {
      console.error('Failed to update beer duty', err);
    } finally {
      setIsBeerDutyUpdating(false);
    }
  };

  const attendeesByStatus = {
    yes: game.attendance.filter(a => a.status === 'yes'),
    maybe: game.attendance.filter(a => a.status === 'maybe'),
    no: game.attendance.filter(a => a.status === 'no')
  };

  return (
    <Card className="bg-white shadow hover:shadow-md transition-shadow duration-200 animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <h3 className="font-bold text-lg">{game.opponent}</h3>
          <p className="text-sm text-gray-600">
            {format(dateObj, 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-gray-500" />
            <span>{game.time}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-gray-500" />
            <span>{game.fieldName}</span>
          </div>
        </div>
        
        {game.notes && (
          <div className="mt-2 text-sm bg-gray-50 p-2 rounded">
            <p className="font-medium">Notes:</p>
            <p>{game.notes}</p>
          </div>
        )}
        
        <div className="mt-3 flex items-center gap-2">
          <Users size={16} className="text-gray-500" />
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                className="p-0 h-auto hover:bg-transparent"
                onClick={() => setIsOpen(!isOpen)}
              >
                <div className="text-sm flex items-center gap-1">
                  <span className="text-attendance-yes">{attendanceCount.yes} attending</span>
                  {attendanceCount.maybe > 0 && (
                    <span className="mx-1 text-attendance-maybe">{attendanceCount.maybe} maybe</span>
                  )}
                  {attendanceCount.no > 0 && (
                    <span className="mx-1 text-attendance-no">{attendanceCount.no} not attending</span>
                  )}
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60">
              <div className="space-y-4">
                {Object.entries(attendeesByStatus).map(([status, attendees]) => (
                  attendees.length > 0 && (
                    <div key={status}>
                      <h4 className={`font-medium mb-2 ${ATTENDANCE_LABELS[status as AttendanceStatus].className}`}>
                        {ATTENDANCE_LABELS[status as AttendanceStatus].emoji} {ATTENDANCE_LABELS[status as AttendanceStatus].text} ({attendees.length})
                      </h4>
                      <ul className="space-y-1">
                        {attendees.map(attendee => (
                          <li key={attendee.userId} className="text-sm">
                            {attendee.userName}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="mt-2 flex items-center gap-2">
          <Beer size={16} className="text-gray-500" />
          <div className="text-sm">
            {game.beerDutyName ? (
              <span className="font-medium">Beer duty: {game.beerDutyName}</span>
            ) : (
              <span className="text-gray-500">Beer duty: Unclaimed</span>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row gap-2">
        <div className="flex gap-1 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            disabled={isAttendanceUpdating}
            className={`flex-1 ${game.userAttendance === 'yes' ? ATTENDANCE_LABELS.yes.className : ''}`}
            onClick={() => handleAttendanceUpdate('yes')}
          >
            ✅
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isAttendanceUpdating}
            className={`flex-1 ${game.userAttendance === 'maybe' ? ATTENDANCE_LABELS.maybe.className : ''}`}
            onClick={() => handleAttendanceUpdate('maybe')}
          >
            🤷
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isAttendanceUpdating}
            className={`flex-1 ${game.userAttendance === 'no' ? ATTENDANCE_LABELS.no.className : ''}`}
            onClick={() => handleAttendanceUpdate('no')}
          >
            ❌
          </Button>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <AddToCalendar game={game} />
          
          <Button
            variant="outline"
            size="sm"
            className={`w-full sm:w-auto ${game.beerDutyId === user?.id ? 'beer-duty' : ''}`}
            onClick={handleBeerDuty}
            disabled={isBeerDutyUpdating || (!user?.isAdmin && game.beerDutyId && game.beerDutyId !== user?.id)}
          >
            🍻 {game.beerDutyId === user?.id ? 'My Beer Duty' : (game.beerDutyId ? 'Claimed' : 'Beer Duty')}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default GameCard;
