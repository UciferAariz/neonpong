-- Fix security definer view by adding security_invoker
DROP VIEW IF EXISTS public.leaderboard;

CREATE VIEW public.leaderboard 
WITH (security_invoker=on) AS
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