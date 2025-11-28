import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Trophy, Gamepad2, TrendingUp, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getPlayerStats, PlayerStats } from '@/lib/statsService';

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const playerStats = await getPlayerStats(user.id);
      
      if (playerStats) {
        setStats(playerStats);
      } else {
        // Use default stats if fetch fails
        setStats({
          id: user.id,
          user_id: user.id,
          games_played: 0,
          games_won: 0,
          total_points: 0,
          current_rank: 'Bronze',
          best_streak: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
      setLoading(false);
    };

    fetchStats();
  }, [user?.id]);

  const getRankColor = (rank: string) => {
    switch (rank.toLowerCase()) {
      case 'bronze':
        return 'from-orange-400 to-orange-600';
      case 'silver':
        return 'from-gray-300 to-gray-500';
      case 'gold':
        return 'from-yellow-300 to-yellow-600';
      case 'platinum':
        return 'from-blue-300 to-blue-600';
      case 'diamond':
        return 'from-cyan-300 to-cyan-600';
      default:
        return 'from-neon-purple to-neon-pink';
    }
  };

  const winRate = stats && stats.games_played > 0 
    ? Math.round((stats.games_won / stats.games_played) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-deep-space cyber-grid flex flex-col items-center justify-center p-8">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/game')}
        className="absolute top-8 left-8 flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Menu
      </motion.button>

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-6xl font-black neon-text mb-2">PLAYER PROFILE</h1>
        <p className="text-xl text-foreground/70 font-medium">{user?.email}</p>
      </motion.div>

      {/* Loading State */}
      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-12 h-12 neon-text animate-spin" />
          <p className="text-foreground/70">Loading your stats...</p>
        </motion.div>
      ) : stats ? (
        /* Main Profile Card */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-2xl"
        >
          <Card className="bg-card/50 backdrop-blur-xl border-2 border-primary/30 p-10 space-y-8">
            {/* Rank Section */}
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-foreground/60 uppercase tracking-wider">Current Rank</p>
                <h2 className="text-4xl font-bold neon-text">{stats.current_rank}</h2>
              </div>
              <div
                className={`
                  w-32 h-32 rounded-full bg-gradient-to-br ${getRankColor(stats.current_rank)}
                  flex items-center justify-center shadow-neon
                `}
              >
                <Trophy className="w-16 h-16 text-white" />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              {/* Games Played */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-background/40 rounded-lg p-6 border border-primary/20 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-foreground/60 uppercase tracking-wider">Games Played</p>
                  <Gamepad2 className="w-5 h-5 text-neon-cyan" />
                </div>
                <p className="text-4xl font-bold neon-text">{stats.games_played}</p>
              </motion.div>

              {/* Games Won */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-background/40 rounded-lg p-6 border border-primary/20 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-foreground/60 uppercase tracking-wider">Games Won</p>
                  <Trophy className="w-5 h-5 text-neon-green" />
                </div>
                <p className="text-4xl font-bold text-neon-green">{stats.games_won}</p>
              </motion.div>

              {/* Win Rate */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-background/40 rounded-lg p-6 border border-primary/20 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-foreground/60 uppercase tracking-wider">Win Rate</p>
                  <TrendingUp className="w-5 h-5 text-neon-pink" />
                </div>
                <p className="text-4xl font-bold text-neon-pink">{winRate}%</p>
              </motion.div>
            </div>

            {/* Total Points */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-r from-neon-purple/10 to-neon-pink/10 rounded-lg p-6 border border-neon-purple/30"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-foreground/60 uppercase tracking-wider">Total Points</p>
                <p className="text-3xl font-bold neon-text-pink">{stats.total_points.toLocaleString()}</p>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex gap-4 pt-4"
            >
              <Button
                onClick={() => navigate('/game')}
                className="flex-1 bg-gradient-to-r from-neon-cyan to-neon-green hover:shadow-neon"
                size="lg"
              >
                <Gamepad2 className="mr-2 w-5 h-5" />
                Back to Play
              </Button>
            </motion.div>
          </Card>
        </motion.div>
      ) : (
        <Card className="bg-card/50 backdrop-blur-xl border-2 border-primary/30 p-10">
          <p className="text-foreground/70">Unable to load stats. Please try again.</p>
        </Card>
      )}

      {/* Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-8 text-center text-sm text-foreground/50 max-w-2xl"
      >
        <p>Your stats are updated in real-time as you play online matches!</p>
      </motion.div>
    </div>
  );
};

export default Profile;
