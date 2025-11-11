-- Drop the security definer view and recreate without security definer
DROP VIEW IF EXISTS public.leaderboard;

-- Create view without security definer (uses invoker's permissions)
CREATE OR REPLACE VIEW public.leaderboard 
WITH (security_invoker = true)
AS
SELECT 
  p.user_id,
  p.display_name,
  COUNT(DISTINCT up.topic_id) as completed_topics,
  (SELECT COUNT(*) FROM public.topics) as total_topics,
  ROUND(
    (COUNT(DISTINCT up.topic_id)::numeric / NULLIF((SELECT COUNT(*) FROM public.topics), 0)::numeric) * 100,
    1
  ) as completion_percentage
FROM public.profiles p
LEFT JOIN public.user_progress up ON p.user_id = up.user_id AND up.completed = true
GROUP BY p.user_id, p.display_name
ORDER BY completion_percentage DESC, completed_topics DESC;