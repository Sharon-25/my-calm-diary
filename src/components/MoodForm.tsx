import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const moods = [
  { value: 'happy', emoji: '🙂', label: 'Happy', color: 'mood-happy' },
  { value: 'neutral', emoji: '😐', label: 'Neutral', color: 'mood-neutral' },
  { value: 'sad', emoji: '😞', label: 'Sad', color: 'mood-sad' },
  { value: 'stressed', emoji: '😰', label: 'Stressed', color: 'mood-stressed' },
  { value: 'excited', emoji: '🤩', label: 'Excited', color: 'mood-excited' },
] as const;

interface MoodFormProps {
  onEntryAdded: () => void;
}

export const MoodForm = ({ onEntryAdded }: MoodFormProps) => {
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMood) {
      toast({
        title: "Please select a mood",
        description: "Choose how you're feeling today",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('mood_entries')
        .insert({
          user_id: user.id,
          mood: selectedMood,
          note: note || null,
        });

      if (error) throw error;

      toast({
        title: "Mood logged!",
        description: "Your mood has been saved successfully.",
      });

      setSelectedMood('');
      setNote('');
      onEntryAdded();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-card shadow-card border-0">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-center">
          How are you feeling right now?
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mood Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Select your mood
            </label>
            <div className="grid grid-cols-5 gap-3">
              {moods.map((mood) => (
                <Button
                  key={mood.value}
                  type="button"
                  variant="mood"
                  onClick={() => setSelectedMood(mood.value)}
                  className={`
                    ${selectedMood === mood.value
                      ? 'border-primary shadow-glow scale-110'
                      : 'border-border'
                    }
                  `}
                  title={mood.label}
                >
                  {mood.emoji}
                </Button>
              ))}
            </div>
          </div>

          {/* Note Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Add a note (optional)
            </label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What's on your mind? Any thoughts about your mood today..."
              className="bg-card border-border resize-none"
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="gradient"
            className="w-full"
            disabled={loading || !selectedMood}
          >
            {loading ? "Saving..." : "Log Mood"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};