import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

interface Player {
  id: string;
  name: string;
  sport: string;
  matches: number;
  score: number;
  assists: number;
  rebounds: number;
  wins: number;
}

interface ComparisonData {
  comparison: {
    player1: Player;
    player2: Player;
  };
  trends: {
    player1: { slope: number; direction: string };
    player2: { slope: number; direction: string };
  };
  insights: string[];
}

const Compare = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const player1Id = searchParams.get("player1");
    const player2Id = searchParams.get("player2");

    if (!player1Id || !player2Id) {
      toast.error("Please select two players to compare");
      navigate("/");
      return;
    }

    comparePlayers(player1Id, player2Id);
  }, [location.search, navigate]);

  const comparePlayers = async (player1Id: string, player2Id: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("compare-players", {
        body: { player1Id, player2Id },
      });

      if (error) throw error;
      setComparisonData(data);
    } catch (error) {
      console.error("Error comparing players:", error);
      toast.error("Failed to compare players");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Analyzing performance data...</p>
        </div>
      </div>
    );
  }

  if (!comparisonData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center">
        <p className="text-muted-foreground">No comparison data available</p>
      </div>
    );
  }

  const { comparison, trends, insights } = comparisonData;
  const { player1, player2 } = comparison;

  // Prepare data for charts
  const statsComparison = [
    {
      stat: "Score",
      [player1.name]: player1.score,
      [player2.name]: player2.score,
    },
    {
      stat: "Assists",
      [player1.name]: player1.assists,
      [player2.name]: player2.assists,
    },
    {
      stat: "Rebounds",
      [player1.name]: player1.rebounds,
      [player2.name]: player2.rebounds,
    },
    {
      stat: "Wins",
      [player1.name]: player1.wins,
      [player2.name]: player2.wins,
    },
  ];

  const trendData = [
    { metric: "Score", [player1.name]: player1.score, [player2.name]: player2.score },
    { metric: "Assists", [player1.name]: player1.assists, [player2.name]: player2.assists },
    { metric: "Rebounds", [player1.name]: player1.rebounds, [player2.name]: player2.rebounds },
  ];

  const getTrendIcon = (slope: number) => {
    if (slope > 0.5) return <TrendingUp className="w-5 h-5 text-secondary" />;
    if (slope < -0.5) return <TrendingDown className="w-5 h-5 text-destructive" />;
    return <Minus className="w-5 h-5 text-muted-foreground" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Performance Comparison
          </h1>
          <p className="text-xl text-muted-foreground">
            {player1.name} vs {player2.name}
          </p>
        </div>

        {/* Player Stats Comparison Table */}
        <Card className="mb-8 border-2">
          <CardHeader>
            <CardTitle>Stats Overview</CardTitle>
            <CardDescription>Head-to-head statistics comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Metric</th>
                    <th className="text-center py-3 px-4 font-semibold">{player1.name}</th>
                    <th className="text-center py-3 px-4 font-semibold">{player2.name}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">Matches</td>
                    <td className="text-center py-3 px-4 font-semibold">{player1.matches}</td>
                    <td className="text-center py-3 px-4 font-semibold">{player2.matches}</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">Score</td>
                    <td className="text-center py-3 px-4 font-semibold">{player1.score}</td>
                    <td className="text-center py-3 px-4 font-semibold">{player2.score}</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">Assists</td>
                    <td className="text-center py-3 px-4 font-semibold">{player1.assists}</td>
                    <td className="text-center py-3 px-4 font-semibold">{player2.assists}</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">Rebounds</td>
                    <td className="text-center py-3 px-4 font-semibold">{player1.rebounds}</td>
                    <td className="text-center py-3 px-4 font-semibold">{player2.rebounds}</td>
                  </tr>
                  <tr className="hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">Wins</td>
                    <td className="text-center py-3 px-4 font-semibold">{player1.wins}</td>
                    <td className="text-center py-3 px-4 font-semibold">{player2.wins}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Stats Comparison</CardTitle>
              <CardDescription>Side-by-side performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statsComparison}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="stat" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)"
                    }} 
                  />
                  <Legend />
                  <Bar dataKey={player1.name} fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  <Bar dataKey={player2.name} fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <CardTitle>Performance Trend</CardTitle>
              <CardDescription>Cross-metric performance analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="metric" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)"
                    }} 
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey={player1.name} 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", r: 5 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey={player2.name} 
                    stroke="hsl(var(--secondary))" 
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--secondary))", r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights */}
        <Card className="border-2 bg-gradient-to-br from-card to-muted/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              AI-Powered Insights
            </CardTitle>
            <CardDescription>Machine learning analysis of player performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="p-4 rounded-lg bg-card border">
                <div className="flex items-center gap-2 mb-2">
                  {getTrendIcon(trends.player1.slope)}
                  <h3 className="font-semibold">{player1.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{trends.player1.direction}</p>
              </div>
              <div className="p-4 rounded-lg bg-card border">
                <div className="flex items-center gap-2 mb-2">
                  {getTrendIcon(trends.player2.slope)}
                  <h3 className="font-semibold">{player2.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{trends.player2.direction}</p>
              </div>
            </div>
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-card border-l-4 border-l-accent hover:shadow-md transition-shadow"
                >
                  <p className="text-sm leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Power BI Placeholder */}
        <Card className="mt-8 border-2">
          <CardHeader>
            <CardTitle>Advanced Analytics</CardTitle>
            <CardDescription>Power BI Dashboard Integration (Coming Soon)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-96 rounded-lg border-2 border-dashed border-muted flex items-center justify-center bg-muted/10">
              <div className="text-center">
                <p className="text-lg font-semibold text-muted-foreground mb-2">Power BI Dashboard</p>
                <p className="text-sm text-muted-foreground">
                  Embed your Power BI analytics here for deeper insights
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Compare;
