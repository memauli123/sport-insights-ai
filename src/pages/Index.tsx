import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trophy, Users, TrendingUp } from "lucide-react";
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

const SPORTS = ["Basketball", "Football", "Soccer", "Baseball", "Hockey"];

const Index = () => {
  const navigate = useNavigate();
  const [selectedSport, setSelectedSport] = useState<string>("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer1, setSelectedPlayer1] = useState<string>("");
  const [selectedPlayer2, setSelectedPlayer2] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [newPlayer, setNewPlayer] = useState({
    name: "",
    sport: "",
    matches: 0,
    score: 0,
    assists: 0,
    rebounds: 0,
    wins: 0,
  });

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async (sport?: string) => {
    try {
      setLoading(true);
      let query = supabase.from("players").select("*");
      
      if (sport) {
        query = query.eq("sport", sport);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      console.error("Error fetching players:", error);
      toast.error("Failed to load players");
    } finally {
      setLoading(false);
    }
  };

  const handleSportChange = (sport: string) => {
    setSelectedSport(sport);
    setSelectedPlayer1("");
    setSelectedPlayer2("");
    fetchPlayers(sport);
  };

  const handleAddPlayer = async () => {
    if (!newPlayer.name || !newPlayer.sport) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const { error } = await supabase.from("players").insert([newPlayer]);

      if (error) throw error;

      toast.success("Player added successfully!");
      setDialogOpen(false);
      setNewPlayer({
        name: "",
        sport: "",
        matches: 0,
        score: 0,
        assists: 0,
        rebounds: 0,
        wins: 0,
      });
      fetchPlayers(selectedSport);
    } catch (error) {
      console.error("Error adding player:", error);
      toast.error("Failed to add player");
    }
  };

  const handleCompare = () => {
    if (!selectedPlayer1 || !selectedPlayer2) {
      toast.error("Please select two players to compare");
      return;
    }

    if (selectedPlayer1 === selectedPlayer2) {
      toast.error("Please select different players");
      return;
    }

    navigate(`/compare?player1=${selectedPlayer1}&player2=${selectedPlayer2}`);
  };

  const filteredPlayers = selectedSport
    ? players.filter((p) => p.sport === selectedSport)
    : players;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-12 h-12 text-primary" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              PLAYLYTICS AI
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Sports Performance Comparator with AI-Powered Insights
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Players</CardTitle>
              <Users className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{players.length}</div>
              <p className="text-xs text-muted-foreground">Across all sports</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Sports Available</CardTitle>
              <Trophy className="w-5 h-5 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{SPORTS.length}</div>
              <p className="text-xs text-muted-foreground">Different categories</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">AI Analysis</CardTitle>
              <TrendingUp className="w-5 h-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">Active</div>
              <p className="text-xs text-muted-foreground">Real-time insights</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Selection Panel */}
          <div className="lg:col-span-1">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Compare Players</CardTitle>
                <CardDescription>Select sport and players to analyze</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="sport">Sport</Label>
                  <Select value={selectedSport} onValueChange={handleSportChange}>
                    <SelectTrigger id="sport">
                      <SelectValue placeholder="Select a sport" />
                    </SelectTrigger>
                    <SelectContent>
                      {SPORTS.map((sport) => (
                        <SelectItem key={sport} value={sport}>
                          {sport}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedSport && (
                  <>
                    <div>
                      <Label htmlFor="player1">Player 1</Label>
                      <Select value={selectedPlayer1} onValueChange={setSelectedPlayer1}>
                        <SelectTrigger id="player1">
                          <SelectValue placeholder="Select first player" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredPlayers.map((player) => (
                            <SelectItem key={player.id} value={player.id}>
                              {player.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="player2">Player 2</Label>
                      <Select value={selectedPlayer2} onValueChange={setSelectedPlayer2}>
                        <SelectTrigger id="player2">
                          <SelectValue placeholder="Select second player" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredPlayers.map((player) => (
                            <SelectItem key={player.id} value={player.id}>
                              {player.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={handleCompare}
                      className="w-full"
                      size="lg"
                      disabled={!selectedPlayer1 || !selectedPlayer2}
                    >
                      Compare Performance
                    </Button>
                  </>
                )}

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Player
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New Player</DialogTitle>
                      <DialogDescription>Enter player statistics and information</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label htmlFor="name">Player Name *</Label>
                        <Input
                          id="name"
                          value={newPlayer.name}
                          onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                          placeholder="Enter player name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="newSport">Sport *</Label>
                        <Select
                          value={newPlayer.sport}
                          onValueChange={(value) => setNewPlayer({ ...newPlayer, sport: value })}
                        >
                          <SelectTrigger id="newSport">
                            <SelectValue placeholder="Select sport" />
                          </SelectTrigger>
                          <SelectContent>
                            {SPORTS.map((sport) => (
                              <SelectItem key={sport} value={sport}>
                                {sport}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="matches">Matches</Label>
                          <Input
                            id="matches"
                            type="number"
                            value={newPlayer.matches}
                            onChange={(e) => setNewPlayer({ ...newPlayer, matches: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="wins">Wins</Label>
                          <Input
                            id="wins"
                            type="number"
                            value={newPlayer.wins}
                            onChange={(e) => setNewPlayer({ ...newPlayer, wins: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="score">Score</Label>
                          <Input
                            id="score"
                            type="number"
                            value={newPlayer.score}
                            onChange={(e) => setNewPlayer({ ...newPlayer, score: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="assists">Assists</Label>
                          <Input
                            id="assists"
                            type="number"
                            value={newPlayer.assists}
                            onChange={(e) => setNewPlayer({ ...newPlayer, assists: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="rebounds">Rebounds</Label>
                          <Input
                            id="rebounds"
                            type="number"
                            value={newPlayer.rebounds}
                            onChange={(e) => setNewPlayer({ ...newPlayer, rebounds: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      </div>
                      <Button onClick={handleAddPlayer} className="w-full">
                        Add Player
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>

          {/* Players List */}
          <div className="lg:col-span-2">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>
                  {selectedSport ? `${selectedSport} Players` : "All Players"}
                </CardTitle>
                <CardDescription>
                  {loading ? "Loading..." : `${filteredPlayers.length} players available`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredPlayers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg text-muted-foreground">No players found</p>
                    <p className="text-sm text-muted-foreground">Add your first player to get started</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {filteredPlayers.map((player) => (
                      <div
                        key={player.id}
                        className="p-4 rounded-lg border bg-card hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{player.name}</h3>
                            <p className="text-sm text-muted-foreground">{player.sport}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold">
                              {player.wins}/{player.matches}
                            </div>
                            <div className="text-xs text-muted-foreground">Win Rate</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-3">
                          <div>
                            <div className="text-xs text-muted-foreground">Score</div>
                            <div className="text-lg font-bold text-primary">{player.score}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Assists</div>
                            <div className="text-lg font-bold text-secondary">{player.assists}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Rebounds</div>
                            <div className="text-lg font-bold text-accent">{player.rebounds}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
