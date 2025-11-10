import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { TopicSection } from "@/components/TopicSection";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Trophy, Target, LogOut, Plus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Section {
  id: string;
  title: string;
  emoji: string;
  display_order: number;
}

interface Topic {
  id: string;
  text: string;
  section_id: string;
  display_order: number;
}

const Index = () => {
  const { user, loading: authLoading, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [sections, setSections] = useState<Section[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadData();

      // Subscribe to realtime updates for topics
      const channel = supabase
        .channel("topics-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "topics",
          },
          () => {
            loadData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const loadData = async () => {
    try {
      // Load sections
      const { data: sectionsData, error: sectionsError } = await supabase
        .from("sections")
        .select("*")
        .order("display_order");

      if (sectionsError) throw sectionsError;

      // Load topics
      const { data: topicsData, error: topicsError } = await supabase
        .from("topics")
        .select("*")
        .order("display_order");

      if (topicsError) throw topicsError;

      // Load user progress
      const { data: progressData, error: progressError } = await supabase
        .from("user_progress")
        .select("topic_id")
        .eq("user_id", user?.id);

      if (progressError) throw progressError;

      setSections(sectionsData || []);
      setTopics(topicsData || []);
      setCompletedTopics(
        new Set(progressData?.map((p) => p.topic_id) || [])
      );
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTopic = async (topicId: string) => {
    if (!user) return;

    const isCompleted = completedTopics.has(topicId);

    // Optimistic update
    setCompletedTopics((prev) => {
      const newSet = new Set(prev);
      if (isCompleted) {
        newSet.delete(topicId);
      } else {
        newSet.add(topicId);
      }
      return newSet;
    });

    try {
      if (isCompleted) {
        // Remove progress
        const { error } = await supabase
          .from("user_progress")
          .delete()
          .eq("user_id", user.id)
          .eq("topic_id", topicId);

        if (error) throw error;
      } else {
        // Add progress
        const { error } = await supabase.from("user_progress").insert({
          user_id: user.id,
          topic_id: topicId,
        });

        if (error) throw error;
      }
    } catch (error: any) {
      // Revert on error
      setCompletedTopics((prev) => {
        const newSet = new Set(prev);
        if (isCompleted) {
          newSet.add(topicId);
        } else {
          newSet.delete(topicId);
        }
        return newSet;
      });

      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const sectionsWithTopics = sections.map((section) => ({
    ...section,
    topics: topics
      .filter((t) => t.section_id === section.id)
      .map((t) => ({ id: t.id, text: t.text })),
  }));

  const totalTopics = topics.length;
  const completedCount = completedTopics.size;
  const overallProgress = totalTopics > 0 ? (completedCount / totalTopics) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  DSA Exam Prep Tracker
                </h1>
                <p className="text-muted-foreground mt-1">
                  Data Structures and Algorithms (EEPC37)
                </p>
              </div>
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <Button
                    onClick={() => navigate("/admin")}
                    variant="outline"
                    size="sm"
                    className="border-primary/50 hover:bg-primary/10"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Topic
                  </Button>
                )}
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  size="sm"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold text-foreground">
                      {completedCount}
                    </span>
                    <span className="text-muted-foreground">/ {totalTopics}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Topics Completed</p>
                </div>
              </div>
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
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6 max-w-5xl mx-auto">
          {sectionsWithTopics.map((section) => (
            <TopicSection
              key={section.id}
              title={section.title}
              emoji={section.emoji}
              topics={section.topics}
              checkedTopics={completedTopics}
              onToggleTopic={handleToggleTopic}
            />
          ))}
        </div>

        {/* Completion Message */}
        {overallProgress === 100 && (
          <div className="fixed bottom-8 right-8 animate-in slide-in-from-bottom-5 duration-500">
            <div className="bg-gradient-primary rounded-xl p-6 shadow-2xl border border-primary/20 max-w-sm">
              <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8 text-primary-foreground" />
                <div>
                  <h3 className="font-bold text-primary-foreground">
                    Congratulations! 🎉
                  </h3>
                  <p className="text-sm text-primary-foreground/90">
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
