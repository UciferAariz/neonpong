-- Create player_stats table to track user game statistics
CREATE TABLE public.player_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  current_rank TEXT DEFAULT 'Bronze',
  best_streak INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create game_records table to store individual game results
CREATE TABLE public.game_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opponent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  game_mode TEXT NOT NULL, -- 'local', 'ai', 'online'
  user_score INTEGER NOT NULL,
  opponent_score INTEGER NOT NULL,
  result TEXT NOT NULL, -- 'win', 'loss', 'draw'
  points_earned INTEGER DEFAULT 0,
  game_duration INTEGER, -- in seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_player_stats_user_id ON public.player_stats(user_id);
CREATE INDEX idx_game_records_user_id ON public.game_records(user_id);
CREATE INDEX idx_game_records_created_at ON public.game_records(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_records ENABLE ROW LEVEL SECURITY;

-- Create policies for player_stats
CREATE POLICY "Users can read their own stats" ON public.player_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" ON public.player_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for game_records
CREATE POLICY "Users can read their own records" ON public.game_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own records" ON public.game_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to automatically create player_stats on signup
CREATE OR REPLACE FUNCTION public.create_player_stats_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.player_stats (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create stats when new user signs up
CREATE TRIGGER create_player_stats_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.create_player_stats_on_signup();
