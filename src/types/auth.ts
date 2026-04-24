
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { User } from '@/types';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export interface ProfileData {
  name?: string;
  is_admin?: boolean;
  is_player?: boolean;
  created_at?: string;
}
