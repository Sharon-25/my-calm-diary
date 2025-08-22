import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { MoodEntry } from "@/pages/Dashboard";

const moods = [
  { value: 'happy', emoji: '🙂', label: 'Happy' },
  { value: 'neutral', emoji: '😐', label: 'Neutral' },
  { value: 'sad', emoji: '😞', label: 'Sad' },
  { value: 'stressed', emoji: '😰', label: 'Stressed' },
  { value: 'excited', emoji: '🤩', label: 'Excited' },
] as const;

interface EditMoodModalProps {
  entry: MoodEntry;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const EditMoodModal = ({ entry, open, onClose, onUpdate }: EditMoodModalProps) => {
  const [selectedMood, setSelectedMood] = useState(entry.mood);
  const [note, setNote] = useState(entry.note || '');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setSelectedMood(entry.mood);
    setNote(entry.note || '');
  }, [entry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('mood_entries')
        .update({
          mood: selectedMood,
          note: note || null,
        })
        .eq('id', entry.id);

      if (error) throw error;

      toast({
        title: "Entry updated!",
        description: "Your mood entry has been updated successfully.",
      });

      onUpdate();
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-card border-0 shadow-card">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Edit Mood Entry
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mood Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Update your mood
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
              Update your note
            </label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What's on your mind? Any thoughts about your mood today..."
              className="bg-card border-border resize-none"
              rows={3}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              className="flex-1"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Entry"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};