import { supabase } from '@/integrations/supabase/client';

export interface PlayerStats {
  id: string;
  user_id: string;
  games_played: number;
  games_won: number;
  total_points: number;
  current_rank: string;
  best_streak: number;
  created_at: string;
  updated_at: string;
}

export interface GameRecord {
  user_id: string;
  opponent_id?: string;
  game_mode: 'local' | 'ai' | 'online';
  user_score: number;
  opponent_score: number;
  result: 'win' | 'loss' | 'draw';
  points_earned: number;
  game_duration?: number;
}

// Calculate rank based on points
export const calculateRank = (points: number): string => {
  if (points < 500) return 'Bronze';
  if (points < 1000) return 'Silver';
  if (points < 2000) return 'Gold';
  if (points < 3500) return 'Platinum';
  return 'Diamond';
};

// Calculate points earned based on game result
export const calculatePoints = (
  userScore: number,
  opponentScore: number,
  gameMode: 'local' | 'ai' | 'online'
): number => {
  const scoreDifference = Math.abs(userScore - opponentScore);
  let basePoints = 10;

  // Bonus for winning
  if (userScore > opponentScore) {
    basePoints = 50 + scoreDifference * 5;
  } else if (userScore === opponentScore) {
    basePoints = 20;
  } else {
    basePoints = Math.max(5, 20 - scoreDifference * 2);
  }

  // Mode multiplier
  if (gameMode === 'ai') basePoints *= 0.8;
  if (gameMode === 'online') basePoints *= 1.2;

  return Math.round(basePoints);
};

// Fetch player stats
export const getPlayerStats = async (userId: string): Promise<PlayerStats | null> => {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('player_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching stats:', error);
      return null;
    }

    return data as PlayerStats;
  } catch (err) {
    console.error('Error in getPlayerStats:', err);
    return null;
  }
};

// Record a game result
export const recordGameResult = async (gameRecord: GameRecord): Promise<boolean> => {
  if (!supabase) return false;

  try {
    // Get current stats
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) return false;

    const stats = await getPlayerStats(userId);
    if (!stats) return false;

    // Calculate new stats
    const isWin = gameRecord.user_score > gameRecord.opponent_score;
    const newGamesPlayed = stats.games_played + 1;
    const newGamesWon = stats.games_won + (isWin ? 1 : 0);
    const newPoints = stats.total_points + gameRecord.points_earned;
    const newRank = calculateRank(newPoints);

    // Record the game
    const { error: recordError } = await supabase
      .from('game_records')
      .insert([gameRecord]);

    if (recordError) {
      console.error('Error recording game:', recordError);
      return false;
    }

    // Update player stats
    const { error: updateError } = await supabase
      .from('player_stats')
      .update({
        games_played: newGamesPlayed,
        games_won: newGamesWon,
        total_points: newPoints,
        current_rank: newRank,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating stats:', updateError);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error in recordGameResult:', err);
    return false;
  }
};

// Get game history
export const getGameHistory = async (userId: string, limit: number = 10) => {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('game_records')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching game history:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error in getGameHistory:', err);
    return [];
  }
};

// Get leaderboard
export const getLeaderboard = async (limit: number = 50) => {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('player_stats')
      .select('user_id, total_points, current_rank, games_won, games_played')
      .order('total_points', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error in getLeaderboard:', err);
    return [];
  }
};
