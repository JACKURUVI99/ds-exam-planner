-- Create profiles table for user display information
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL,
  display_name text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Everyone can view profiles for the leaderboard
CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$;

-- Trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create a view for leaderboard data
CREATE OR REPLACE VIEW public.leaderboard AS
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