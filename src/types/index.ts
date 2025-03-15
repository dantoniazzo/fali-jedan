export type Sport = 'football' | 'basketball' | 'handball' | 'tennis' | 'volleyball';

export interface Match {
  id: string;
  sport: Sport;
  location: string;
  venue: string;
  latitude: number;
  longitude: number;
  match_time: string;
  team_a: string;
  team_b: string;
  description?: string;
  user_id: string;
}

export interface User {
  id: string;
  email?: string;
  username?: string;
  avatar_url?: string;
}

export interface FilterOptions {
  sport: Sport | 'all';
  location: string;
}