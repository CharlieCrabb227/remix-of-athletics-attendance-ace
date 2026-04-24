
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User } from '@/types';
import { ProfileData } from '@/types/auth';

export const mapSupabaseUserToAppUser = (
  supabaseUser: SupabaseUser | null, 
  profileData?: ProfileData
): User | null => {
  if (!supabaseUser) return null;
  
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: profileData?.name || '',
    isAdmin: profileData?.is_admin || false,
    isPlayer: profileData?.is_player || true,
    createdAt: profileData?.created_at || supabaseUser.created_at || ''
  };
};
