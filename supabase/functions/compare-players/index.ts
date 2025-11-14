import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PlayerStats {
  id: string;
  name: string;
  sport: string;
  matches: number;
  score: number;
  assists: number;
  rebounds: number;
  wins: number;
}

// Linear regression function to calculate trend
function linearRegression(values: number[]): number {
  const n = values.length;
  if (n === 0) return 0;
  
  const x = Array.from({ length: n }, (_, i) => i);
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((a, b, i) => a + b * values[i], 0);
  const sumX2 = x.reduce((a, b) => a + b * b, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  return slope;
}

// Generate AI insights based on player comparison
function generateInsights(player1: PlayerStats, player2: PlayerStats): string[] {
  const insights: string[] = [];
  
  // Compare overall stats
  const p1Total = player1.score + player1.assists + player1.rebounds;
  const p2Total = player2.score + player2.assists + player2.rebounds;
  
  if (p1Total > p2Total * 1.2) {
    insights.push(`${player1.name} demonstrates significantly higher overall performance with ${p1Total} total stats vs ${p2Total}.`);
  } else if (p2Total > p1Total * 1.2) {
    insights.push(`${player2.name} demonstrates significantly higher overall performance with ${p2Total} total stats vs ${p1Total}.`);
  } else {
    insights.push("Both players show comparable overall performance levels.");
  }

  // Analyze consistency (based on matches vs performance)
  const p1Consistency = player1.matches > 0 ? p1Total / player1.matches : 0;
  const p2Consistency = player2.matches > 0 ? p2Total / player2.matches : 0;
  
  if (p1Consistency > p2Consistency * 1.15) {
    insights.push(`${player1.name} shows better consistency with ${p1Consistency.toFixed(1)} stats per match vs ${p2Consistency.toFixed(1)}.`);
  } else if (p2Consistency > p1Consistency * 1.15) {
    insights.push(`${player2.name} shows better consistency with ${p2Consistency.toFixed(1)} stats per match vs ${p1Consistency.toFixed(1)}.`);
  }

  // Win rate comparison
  const p1WinRate = player1.matches > 0 ? (player1.wins / player1.matches) * 100 : 0;
  const p2WinRate = player2.matches > 0 ? (player2.wins / player2.matches) * 100 : 0;
  
  if (p1WinRate > p2WinRate) {
    insights.push(`${player1.name} has a superior win rate of ${p1WinRate.toFixed(1)}% compared to ${p2WinRate.toFixed(1)}%.`);
  } else if (p2WinRate > p1WinRate) {
    insights.push(`${player2.name} has a superior win rate of ${p2WinRate.toFixed(1)}% compared to ${p1WinRate.toFixed(1)}%.`);
  }

  // Performance trend analysis
  const p1Stats = [player1.score, player1.assists, player1.rebounds];
  const p2Stats = [player2.score, player2.assists, player2.rebounds];
  
  const p1Trend = linearRegression(p1Stats);
  const p2Trend = linearRegression(p2Stats);
  
  if (p1Trend > 0.5) {
    insights.push(`${player1.name} shows an improving performance trend across different metrics.`);
  } else if (p1Trend < -0.5) {
    insights.push(`${player1.name} shows a declining trend in certain performance areas.`);
  }
  
  if (p2Trend > 0.5) {
    insights.push(`${player2.name} shows an improving performance trend across different metrics.`);
  } else if (p2Trend < -0.5) {
    insights.push(`${player2.name} shows a declining trend in certain performance areas.`);
  }

  // Specialization insights
  if (player1.score > player1.assists && player1.score > player1.rebounds) {
    insights.push(`${player1.name} is primarily a scorer with ${player1.score} points.`);
  } else if (player1.assists > player1.score && player1.assists > player1.rebounds) {
    insights.push(`${player1.name} excels in playmaking with ${player1.assists} assists.`);
  }
  
  if (player2.score > player2.assists && player2.score > player2.rebounds) {
    insights.push(`${player2.name} is primarily a scorer with ${player2.score} points.`);
  } else if (player2.assists > player2.score && player2.assists > player2.rebounds) {
    insights.push(`${player2.name} excels in playmaking with ${player2.assists} assists.`);
  }

  return insights;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { player1Id, player2Id } = await req.json();

    if (!player1Id || !player2Id) {
      throw new Error('Both player IDs are required');
    }

    // Fetch both players
    const { data: players, error } = await supabase
      .from('players')
      .select('*')
      .in('id', [player1Id, player2Id]);

    if (error) throw error;
    if (!players || players.length !== 2) {
      throw new Error('Could not find both players');
    }

    const player1 = players.find(p => p.id === player1Id)!;
    const player2 = players.find(p => p.id === player2Id)!;

    // Generate comparison data
    const comparison = {
      player1: {
        name: player1.name,
        matches: player1.matches,
        score: player1.score,
        assists: player1.assists,
        rebounds: player1.rebounds,
        wins: player1.wins,
      },
      player2: {
        name: player2.name,
        matches: player2.matches,
        score: player2.score,
        assists: player2.assists,
        rebounds: player2.rebounds,
        wins: player2.wins,
      },
    };

    // Calculate trends
    const p1Trend = linearRegression([player1.score, player1.assists, player1.rebounds]);
    const p2Trend = linearRegression([player2.score, player2.assists, player2.rebounds]);

    // Generate AI insights
    const insights = generateInsights(player1, player2);

    return new Response(
      JSON.stringify({
        comparison,
        trends: {
          player1: {
            slope: p1Trend,
            direction: p1Trend > 0 ? 'Improving performance' : p1Trend < 0 ? 'Declining performance' : 'Stable performance',
          },
          player2: {
            slope: p2Trend,
            direction: p2Trend > 0 ? 'Improving performance' : p2Trend < 0 ? 'Declining performance' : 'Stable performance',
          },
        },
        insights,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in compare-players function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
