import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import type { MoodEntry } from "@/pages/Dashboard";

const moods = {
  'happy': { emoji: '🙂', label: 'Happy' },
  'neutral': { emoji: '😐', label: 'Neutral' },
  'sad': { emoji: '😞', label: 'Sad' },
  'stressed': { emoji: '😰', label: 'Stressed' },
  'excited': { emoji: '🤩', label: 'Excited' },
} as const;

interface MoodListProps {
  entries: MoodEntry[];
  onEdit: (entry: MoodEntry) => void;
  onDelete: () => void;
}

export const MoodList = ({ entries, onEdit, onDelete }: MoodListProps) => {
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this mood entry?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('mood_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Entry deleted",
        description: "Your mood entry has been removed.",
      });

      onDelete();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete entry",
        variant: "destructive",
      });
    }
  };

  if (entries.length === 0) {
    return (
      <Card className="bg-gradient-card shadow-card border-0">
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <div className="text-4xl mb-4">📝</div>
            <p className="text-lg">No mood entries yet</p>
            <p className="text-sm">Start by logging your first mood above!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">
        Your Mood History
      </h2>
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {entries.map((entry) => {
          const mood = moods[entry.mood as keyof typeof moods];
          return (
            <Card key={entry.id} className="bg-gradient-card shadow-soft border-0 hover:shadow-card transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="text-2xl">{mood.emoji}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground">{mood.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(entry.created_at), 'MMM d, yyyy • h:mm a')}
                        </span>
                      </div>
                      {entry.note && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {entry.note}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(entry)}
                      className="h-8 w-8 p-0 hover:bg-primary/10"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(entry.id)}
                      className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};