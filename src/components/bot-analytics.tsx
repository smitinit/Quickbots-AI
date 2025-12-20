import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Users, Clock, Zap, Activity } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { BotType } from "@/types";

export default function BotManagementDashboard({ bot }: { bot: BotType }) {
  const [stats, setStats] = useState<{
    total_conversations: number;
    active_users: number;
    avg_response_time_ms: number;
    success_rate: number;
    tokens_used: number;
    tokens_limit: number;
    tokens_used_percent: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch analytics - stable effect with no function dependencies
  useEffect(() => {
    const fetchAnalytics = async (isInitialLoad = false) => {
      if (!bot.bot_id) {
        setError("Bot ID is missing");
        setLoading(false);
        return;
      }

      if (isInitialLoad) {
        setLoading(true);
      }

      try {
        const res = await fetch(`/api/analytics/${bot.bot_id}`);
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(
            errorData.error ||
              `Failed to load analytics: ${res.status} ${res.statusText}`
          );
        }
        const data = await res.json();
        setStats(data);
        setError(null);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load analytics";
        console.error("Analytics fetch error:", err);
        setError(errorMessage);
      } finally {
        if (isInitialLoad) {
          setLoading(false);
        }
      }
    };

    // Initial load with loading state
    fetchAnalytics(true);

    // Set up 30 second interval for background refetching
    intervalRef.current = setInterval(() => {
      fetchAnalytics(false);
    }, 10000 * 60); // 10 minutes

    // Cleanup interval on unmount or bot_id change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [bot.bot_id]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="size-8 text-primary" />
          <p className="text-sm text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return <div className="p-6 text-destructive text-sm">Failed: {error}</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 space-y-8">
        <Card className="border border-border/40 shadow-none bg-card hover:border-border/60 transition-colors duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <Avatar className="w-14 h-14 ring-2 ring-primary/15 shrink-0">
                  <AvatarFallback className="bg-linear-to-br from-primary/90 to-primary text-primary-foreground font-semibold text-base">
                    {bot.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-lg truncate">
                    {bot.name[0].toUpperCase() + bot.name.slice(1)}
                  </h3>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1.5">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          isOnline
                            ? "bg-green-500 animate-pulse"
                            : "bg-destructive"
                        )}
                      />
                      <p className="text-sm text-muted-foreground">
                        {isOnline ? "Online" : "Offline"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {bot.description}
            </p>
          </CardContent>
        </Card>

        {/* KEY METRICS */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-primary/10">
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <h4 className="font-semibold text-foreground text-base">
              Key Metrics
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Conversations */}
            <Card className="border border-border/40 shadow-none bg-card/50 hover:bg-card/70 transition-all duration-300 hover:border-border/60">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Conversations
                    </p>
                    <div className="text-2xl font-bold text-foreground">
                      {stats.total_conversations}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-blue-500/10">
                    <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Users */}
            <Card className="border border-border/40 shadow-none bg-card/50 hover:bg-card/70 transition-all duration-300 hover:border-border/60">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Active Users
                    </p>
                    <div className="text-2xl font-bold text-foreground">
                      {stats.active_users}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-green-500/10">
                    <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Avg Response Time */}
            <Card className="border border-border/40 shadow-none bg-card/50 hover:bg-card/70 transition-all duration-300 hover:border-border/60">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Avg Response Time
                    </p>
                    <div className="text-2xl font-bold text-foreground">
                      {stats.avg_response_time_ms}ms
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-orange-500/10">
                    <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Success Rate */}
            <Card className="border border-border/40 shadow-none bg-card/50 hover:bg-card/70 transition-all duration-300 hover:border-border/60">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Success Rate
                    </p>
                    <div className="text-2xl font-bold text-foreground">
                      {stats.success_rate}%
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-purple-500/10">
                    <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* SYSTEM HEALTH */}
        <Card className="border border-border/40 shadow-none bg-card">
          <CardHeader className="pb-5 border-b border-border/30">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2.5">
              <div className="p-1.5 rounded-md bg-primary/10">
                <Activity className="w-4 h-4 text-primary" />
              </div>
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Token Usage */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">
                  Tokens Used
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {stats.tokens_used}
                </span>
              </div>
              <Progress
                value={stats.tokens_used_percent}
                className="h-2 bg-muted/40"
              />
              <div className="text-xs text-muted-foreground pt-1">
                {stats.tokens_used} / {stats.tokens_limit} tokens
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
