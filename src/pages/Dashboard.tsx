import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { MoodForm } from "@/components/MoodForm";
import { MoodList } from "@/components/MoodList";
import { EditMoodModal } from "@/components/EditMoodModal";
import { LogOut } from "lucide-react";

export interface MoodEntry {
  id: string;
  user_id: string;
  mood: 'happy' | 'neutral' | 'sad' | 'stressed' | 'excited';
  note: string | null;
  created_at: string;
  updated_at: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState<MoodEntry | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadEntries();
      } else {
        navigate("/auth");
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        setTimeout(() => {
          loadEntries();
        }, 0);
      } else {
        setUser(null);
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries((data || []) as MoodEntry[]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load mood entries",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  const handleEntryAdded = () => {
    loadEntries();
  };

  const handleEntryUpdated = () => {
    loadEntries();
    setEditingEntry(null);
  };

  const handleEntryDeleted = () => {
    loadEntries();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Mood Journal
            </h1>
            <p className="text-muted-foreground mt-1">
              How are you feeling today, {user.email?.split('@')[0]}?
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            size="sm"
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>

        {/* Mood Form */}
        <div className="mb-8">
          <MoodForm onEntryAdded={handleEntryAdded} />
        </div>

        {/* Mood Entries */}
        <MoodList 
          entries={entries}
          onEdit={setEditingEntry}
          onDelete={handleEntryDeleted}
        />

        {/* Edit Modal */}
        {editingEntry && (
          <EditMoodModal
            entry={editingEntry}
            open={!!editingEntry}
            onClose={() => setEditingEntry(null)}
            onUpdate={handleEntryUpdated}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;