
export interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  isPlayer: boolean;
  createdAt: string;
}

export interface Game {
  id: string;
  date: string;
  time: string;
  fieldName: string;
  opponent: string;
  notes?: string;
  beerDutyId?: string;
  beerDutyName?: string;
  createdAt: string;
}

export type AttendanceStatus = 'yes' | 'no' | 'maybe' | undefined;

export interface Attendance {
  gameId: string;
  userId: string;
  status: AttendanceStatus;
  userName: string;
}

export interface GameWithAttendance extends Game {
  attendance: Attendance[];
  userAttendance?: AttendanceStatus;
}

export const ATTENDANCE_LABELS = {
  yes: {
    text: 'Attending',
    emoji: '✅',
    className: 'attendance-yes'
  },
  no: {
    text: 'Not Attending',
    emoji: '❌',
    className: 'attendance-no'
  },
  maybe: {
    text: 'Maybe',
    emoji: '🤷',
    className: 'attendance-maybe'
  },
  undefined: {
    text: 'No Response',
    emoji: '❓',
    className: ''
  }
};
