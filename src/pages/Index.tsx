import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { TopicSection } from "@/components/TopicSection";
import { Leaderboard } from "@/components/Leaderboard";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Trophy, Target, LogOut, Shield, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Topic {
  id: string;
  text: string;
}

interface Section {
  id: string;
  title: string;
  emoji: string;
  topics: Topic[];
}

const Index = () => {
  const { user, isAdmin, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [sections, setSections] = useState<Section[]>([]);
  const [checkedTopics, setCheckedTopics] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Load sections and topics from database
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load sections with topics
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('sections')
        .select('*')
        .order('display_order');

      if (sectionsError) throw sectionsError;

      const { data: topicsData, error: topicsError } = await supabase
        .from('topics')
        .select('*')
        .order('display_order');

      if (topicsError) throw topicsError;

      // Group topics by section
      const sectionsWithTopics = sectionsData.map((section) => ({
        id: section.id,
        title: section.title,
        emoji: section.emoji,
        topics: topicsData
          .filter((topic) => topic.section_id === section.id)
          .map((topic) => ({
            id: topic.id,
            text: topic.text,
          })),
      }));

      setSections(sectionsWithTopics);

      // Load user progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('topic_id')
        .eq('user_id', user?.id);

      if (progressError) throw progressError;

      setCheckedTopics(new Set(progressData.map((p) => p.topic_id)));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTopic = async (topicId: string) => {
    const isChecked = checkedTopics.has(topicId);

    // Optimistic update
    setCheckedTopics((prev) => {
      const newSet = new Set(prev);
      if (isChecked) {
        newSet.delete(topicId);
      } else {
        newSet.add(topicId);
      }
      return newSet;
    });

    try {
      if (isChecked) {
        // Remove progress
        await supabase
          .from('user_progress')
          .delete()
          .eq('user_id', user?.id)
          .eq('topic_id', topicId);
      } else {
        // Add progress
        await supabase
          .from('user_progress')
          .insert({
            user_id: user?.id,
            topic_id: topicId,
            completed: true,
          });
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      // Revert on error
      setCheckedTopics((prev) => {
        const newSet = new Set(prev);
        if (isChecked) {
          newSet.add(topicId);
        } else {
          newSet.delete(topicId);
        }
        return newSet;
      });
    }
  };

  const totalTopics = sections.reduce((sum, section) => sum + section.topics.length, 0);
  const completedTopics = Array.from(checkedTopics).length;
  const overallProgress = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your progress...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col gap-4">
            {/* Title and Actions Row */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent truncate">
                  DSA Exam Prep Tracker
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">
                  Data Structures and Algorithms
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/admin')}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Add Topic</span>
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={signOut}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                <div className="flex items-baseline gap-1">
                  <span className="text-xl md:text-2xl font-bold text-foreground">
                    {completedTopics}
                  </span>
                  <span className="text-muted-foreground text-sm">/ {totalTopics}</span>
                </div>
              </div>
              {isAdmin && (
                <div className="flex items-center gap-2 text-accent text-sm">
                  <Shield className="h-4 w-4" />
                  <span>Admin</span>
                </div>
              )}
            </div>

            {/* Overall Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Overall Progress</span>
                </div>
                <span className="font-semibold text-foreground">
                  {overallProgress.toFixed(1)}%
                </span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-primary transition-all duration-700 ease-out relative overflow-hidden"
                  style={{ width: `${overallProgress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" 
                       style={{ animation: 'shimmer 2s linear infinite' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 mt-6 md:mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Topics Section */}
          <div className="lg:col-span-2 space-y-6">
            {sections.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No topics yet. {isAdmin && "Add your first topic!"}</p>
              </div>
            ) : (
              sections.map((section) => (
                <TopicSection
                  key={section.id}
                  title={section.title}
                  emoji={section.emoji}
                  topics={section.topics}
                  checkedTopics={checkedTopics}
                  onToggleTopic={handleToggleTopic}
                />
              ))
            )}
          </div>

          {/* Leaderboard Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Leaderboard />
            </div>
          </div>
        </div>

        {/* Completion Message */}
        {overallProgress === 100 && totalTopics > 0 && (
          <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 animate-in slide-in-from-bottom-5 duration-500 z-40">
            <div className="bg-gradient-primary rounded-xl p-4 md:p-6 shadow-2xl border border-primary/20 max-w-xs md:max-w-sm">
              <div className="flex items-center gap-3">
                <Trophy className="h-6 w-6 md:h-8 md:w-8 text-primary-foreground shrink-0" />
                <div>
                  <h3 className="font-bold text-primary-foreground text-sm md:text-base">
                    Congratulations! 🎉
                  </h3>
                  <p className="text-xs md:text-sm text-primary-foreground/90">
                    You've completed all topics!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
