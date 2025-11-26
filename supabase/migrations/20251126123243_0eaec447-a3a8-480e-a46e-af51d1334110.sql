-- Create profiles table for player data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create matches table
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT NOT NULL,
  player_left_id UUID REFERENCES public.profiles(id),
  player_right_id UUID REFERENCES public.profiles(id),
  score_left INTEGER NOT NULL DEFAULT 0,
  score_right INTEGER NOT NULL DEFAULT 0,
  winner_id UUID REFERENCES public.profiles(id),
  duration_seconds INTEGER,
  game_mode TEXT CHECK (game_mode IN ('local', 'online')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Matches policies
CREATE POLICY "Matches are viewable by everyone"
  ON public.matches FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create matches"
  ON public.matches FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create leaderboard view
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
  p.id,
  p.username,
  p.avatar_url,
  COUNT(m.id) as total_games,
  SUM(CASE WHEN m.winner_id = p.id THEN 1 ELSE 0 END) as wins,
  SUM(CASE WHEN m.winner_id != p.id AND (m.player_left_id = p.id OR m.player_right_id = p.id) THEN 1 ELSE 0 END) as losses,
  ROUND(
    (SUM(CASE WHEN m.winner_id = p.id THEN 1 ELSE 0 END)::DECIMAL / 
    NULLIF(COUNT(m.id), 0) * 100), 2
  ) as win_percentage
FROM public.profiles p
LEFT JOIN public.matches m ON (m.player_left_id = p.id OR m.player_right_id = p.id)
GROUP BY p.id, p.username, p.avatar_url
ORDER BY wins DESC, win_percentage DESC;

-- Create function to update profile timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for profile updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create rooms table for online multiplayer
CREATE TABLE public.rooms (
  id TEXT PRIMARY KEY,
  password_hash TEXT NOT NULL,
  host_id UUID REFERENCES public.profiles(id),
  guest_id UUID REFERENCES public.profiles(id),
  status TEXT CHECK (status IN ('waiting', 'playing', 'finished')) DEFAULT 'waiting',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '1 hour')
);

-- Enable RLS
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Rooms policies
CREATE POLICY "Rooms are viewable by participants"
  ON public.rooms FOR SELECT
  USING (auth.uid() = host_id OR auth.uid() = guest_id);

CREATE POLICY "Authenticated users can create rooms"
  ON public.rooms FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = host_id);

CREATE POLICY "Participants can update rooms"
  ON public.rooms FOR UPDATE
  USING (auth.uid() = host_id OR auth.uid() = guest_id);

-- Create function to clean up expired rooms
CREATE OR REPLACE FUNCTION public.cleanup_expired_rooms()
RETURNS void AS $$
BEGIN
  DELETE FROM public.rooms
  WHERE expires_at < now() AND status != 'playing';
END;
$$ LANGUAGE plpgsql SET search_path = public;
