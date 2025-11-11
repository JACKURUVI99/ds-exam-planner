import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Plus, Loader2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const topicSchema = z.object({
  text: z.string().trim().min(1, "Topic text cannot be empty").max(500, "Topic text is too long"),
  sectionId: z.string().uuid("Invalid section selected"),
});

const Admin = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [sections, setSections] = useState<any[]>([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [topicText, setTopicText] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have admin permissions",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [isAdmin, authLoading, navigate, toast]);

  useEffect(() => {
    loadSections();
    loadUsers();
  }, []);

  const loadSections = async () => {
    const { data, error } = await supabase
      .from("sections")
      .select("*")
      .order("display_order");

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load sections",
        variant: "destructive",
      });
    } else {
      setSections(data || []);
    }
  };

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, display_name, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error loading users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate input
    const validation = topicSchema.safeParse({
      text: topicText,
      sectionId: selectedSection,
    });

    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      // Get the max display_order for this section
      const { data: maxOrder } = await supabase
        .from("topics")
        .select("display_order")
        .eq("section_id", selectedSection)
        .order("display_order", { ascending: false })
        .limit(1)
        .maybeSingle();

      const nextOrder = maxOrder ? maxOrder.display_order + 1 : 1;

      const { error } = await supabase.from("topics").insert({
        section_id: selectedSection,
        text: topicText,
        display_order: nextOrder,
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Topic added successfully",
      });

      setTopicText("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add topic",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-2xl py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tracker
        </Button>

        <Card className="p-8 bg-gradient-card border-border/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Plus className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Add New Topic</h1>
              <p className="text-sm text-muted-foreground">Admin Panel</p>
            </div>
          </div>

          <form onSubmit={handleAddTopic} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="section">Section</Label>
              <Select value={selectedSection} onValueChange={setSelectedSection} required>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Select a section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.emoji} {section.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">Topic Text</Label>
              <Input
                id="topic"
                placeholder="Enter topic description"
                value={topicText}
                onChange={(e) => setTopicText(e.target.value)}
                required
                className="bg-secondary border-border"
              />
              <p className="text-xs text-muted-foreground">
                Maximum 500 characters
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={loading || !selectedSection}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Topic
                </>
              )}
            </Button>
          </form>
        </Card>

        <Card className="mt-6 bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              All Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingUsers ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : users.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No users found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.user_id}>
                      <TableCell className="font-medium">{user.display_name}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {user.user_id}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
