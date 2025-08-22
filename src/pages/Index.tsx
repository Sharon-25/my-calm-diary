import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@supabase/supabase-js";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGetStarted = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Mood Journal
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            Track your emotions, reflect on your day
          </p>
          <p className="text-muted-foreground">
            A beautiful, simple way to understand your emotional patterns and improve your wellbeing
          </p>
        </div>

        <Card className="bg-gradient-card shadow-card border-0 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-4 text-2xl">
              <span className="text-3xl">🙂</span>
              <span className="text-3xl">😐</span>
              <span className="text-3xl">😞</span>
              <span className="text-3xl">😰</span>
              <span className="text-3xl">🤩</span>
            </CardTitle>
            <CardDescription className="text-base">
              Log your daily moods with simple emoji selections and personal notes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-left mb-6">
              <div className="space-y-2">
                <div className="text-lg font-semibold">📝 Easy Logging</div>
                <p className="text-sm text-muted-foreground">
                  Quick emoji selection with optional notes
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-lg font-semibold">📊 Track Patterns</div>
                <p className="text-sm text-muted-foreground">
                  View your mood history and trends over time
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-lg font-semibold">🔒 Private & Secure</div>
                <p className="text-sm text-muted-foreground">
                  Your entries are private and securely stored
                </p>
              </div>
            </div>
            
            <Button 
              variant="gradient" 
              size="lg" 
              onClick={handleGetStarted}
              className="text-lg px-8"
            >
              {user ? "Open Dashboard" : "Get Started"}
            </Button>
          </CardContent>
        </Card>

        <p className="text-sm text-muted-foreground">
          {user ? `Welcome back, ${user.email?.split('@')[0]}!` : "Start your emotional wellness journey today"}
        </p>
      </div>
    </div>
  );
};

export default Index;
