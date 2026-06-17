'use client';
import { useState, useEffect } from "react";

const EDGE_COLORS = {
  "Strong Lean": { bg: "#0f3d2a", border: "#22c55e", text: "#4ade80", badge: "#166534" },
  "Lean":        { bg: "#1a3a1a", border: "#86efac", text: "#86efac", badge: "#14532d" },
  "Slight Edge": { bg: "#1e2a1e", border: "#4ade80", text: "#6ee7b7", badge: "#14532d" },
  "Too Close":   { bg: "#1a1a2e", border: "#6366f1", text: "#a5b4fc", badge: "#3730a3" },
  "Pass":        { bg: "#1c1a1a", border: "#6b7280", text: "#9ca3af", badge: "#374151" },
};

function Spinner() {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"32px 0" }}>
      <div style={{ width:36, height:36, border:"3px solid #21262d", borderTop:"3px solid #388bfd", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function getToday() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
}

async function mlbFetch(endpoint) {
  const MLB_API = "https://statsapi.mlb.com/api/v1";
  const url = `${MLB_API}${endpoint}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`MLB API ${res.status}`);
  return res.json();
}

export default function MLBF5Live() {
  const [games, setGames] = useState([]);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [gamesError, setGamesError] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [step, setStep] = useState("select");
  const [log, setLog] = useState([]);
  const [result, setResult] = useState(null);

  const addLog = (msg) => setLog(prev => [...prev, msg]);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    setGamesLoading(true);
    setGamesError(null);
    try {
      const today = getToday();
      const data = await mlbFetch(`/schedule?sportId=1&date=${today}&gameType=R&hydrate=probablePitcher,venue,weather,team`);
      
      const gamesList = (data.dates?.[0]?.games || []).map((g) => ({
        game_pk: g.gamePk,
        away_team: g.teams.away.team.name,
        away_pitcher_id: g.teams.away.probablePitcher?.id || null,
        away_pitcher_name: g.teams.away.probablePitcher?.fullName || "TBD",
        home_team: g.teams.home.team.name,
        home_pitcher_id: g.teams.home.probablePitcher?.id || null,
        home_pitcher_name: g.teams.home.probablePitcher?.fullName || "TBD",
        venue: g.venue?.name || "Unknown Park",
        game_time: g.gameDateTime ? new Date(g.gameDateTime).toLocaleTimeString('en-US', {hour:'numeric',minute:'2-digit'}) + " ET" : "TBA",
      }));

      setGames(gamesList);
      if (gamesList.length > 0) setSelectedGame(gamesList[0]);
    } catch (e) {
      setGamesError(e.message);
    }
    setGamesLoading(false);
  };

  const fetchPitcherStats = async (pitcherId, pitcherName) => {
    try {
      const data = await mlbFetch(`/people/${pitcherId}?hydrate=stats(group=pitching,type=season,season=2026,gameType=R)`);
      const stat = data.people?.[0]?.stats?.[0]?.splits?.[0]?.stat || {};
      const person = data.people?.[0] || {};
      return {
        name: person.fullName || pitcherName,
        era: (stat.era ? Number(stat.era).toFixed(2) : "—"),
        whip: (stat.whip ? Number(stat.whip).toFixed(2) : "—"),
      };
    } catch (e) {
      return { name: pitcherName, era: "—", whip: "—" };
    }
  };

  const analyze = async () => {
    if (!selectedGame) return;
    setStep("fetching");
    setLog([]);
    setResult(null);

    try {
      addLog(`Loading ${selectedGame.away_team} @ ${selectedGame.home_team}...`);

      const ap = selectedGame.away_pitcher_id
        ? await fetchPitcherStats(selectedGame.away_pitcher_id, selectedGame.away_pitcher_name)
        : { name: selectedGame.away_pitcher_name, era: "—", whip: "—" };
      addLog(`✓ ${ap.name}: ERA ${ap.era}`);

      const hp = selectedGame.home_pitcher_id
        ? await fetchPitcherStats(selectedGame.home_pitcher_id, selectedGame.home_pitcher_name)
        : { name: selectedGame.home_pitcher_name, era: "—", whip: "—" };
      addLog(`✓ ${hp.name}: ERA ${hp.era}`);

      addLog("Running F5 ML analysis...");

      const awayERA = parseFloat(ap.era);
      const homeERA = parseFloat(hp.era);

      let pitcher_edge = "even";
      let confidence = 5;
      let win_prob = { away: 45, home: 45, push: 10 };

      if (!isNaN(awayERA) && !isNaN(homeERA)) {
        const eraDiff = homeERA - awayERA;
        if (eraDiff > 1.0) {
          pitcher_edge = "away";
          confidence = 7;
          win_prob = { away: 60, home: 30, push: 10 };
        } else if (eraDiff < -1.0) {
          pitcher_edge = "home";
          confidence = 7;
          win_prob = { away: 30, home: 60, push: 10 };
        } else if (Math.abs(eraDiff) > 0.3) {
          pitcher_edge = eraDiff > 0 ? "away" : "home";
          confidence = 6;
          win_prob = eraDiff > 0 ? { away: 52, home: 38, push: 10 } : { away: 38, home: 52, push: 10 };
        }
      }

      const edge = confidence >= 8 ? "Strong Lean" : confidence >= 7 ? "Lean" : confidence >= 6 ? "Slight Edge" : "Too Close";
      const side = pitcher_edge === "away" ? selectedGame.away_team : pitcher_edge === "home" ? selectedGame.home_team : "even";
      const pick = side !== "even" ? `${side} F5 ML` : "No Bet";

      setResult({
        edge,
        side,
        pick,
        confidence,
        win_prob,
        away: { team: selectedGame.away_team, ...ap },
        home: { team: selectedGame.home_team, ...hp },
        venue: selectedGame.venue,
        game_time: selectedGame.game_time,
      });
      setStep("result");
    } catch (e) {
      addLog(`Error: ${e.message}`);
      setStep("error");
    }
  };

  const reset = () => {
    setStep("select");
    setResult(null);
    setLog([]);
  };

  const ec = result ? (EDGE_COLORS[result.edge] || EDGE_COLORS["Pass"]) : null;

  const StatBox = ({ label, value }) => (
    <div style={{ background:"#010409", border:"1px solid #21262d", borderRadius:7, padding:"8px 10px", textAlign:"center" }}>
      <div style={{ fontSize:9, color:"#6b7280", fontFamily:"monospace", textTransform:"uppercase", marginBottom:3 }}>{label}</div>
      <div style={{ fontSize:13, fontWeight:700, color:"#c9d1d9" }}>{value}</div>
    </div>
  );

  const today = getToday();

  return (
    <div style={{ minHeight:"100vh", background:"#010409", color:"#e6edf3", fontFamily:"'Inter','Segoe UI',sans-serif" }}>
      <div style={{ background:"#0d1117", borderBottom:"1px solid #21262d", padding:"22px 24px 16px" }}>
        <div style={{ maxWidth:800, margin:"0 auto" }}>
          <div style={{ fontSize:10, color:"#388bfd", letterSpacing:"0.2em", textTransform:"uppercase", fontFamily:"monospace", marginBottom:3 }}>MLB · F5 · {today}</div>
          <h1 style={{ fontSize:26, fontWeight:800, margin:0 }}>F5 ML Finder</h1>
        </div>
      </div>

      <div style={{ maxWidth:800, margin:"0 auto", padding:"24px" }}>
        <div style={{ background:"#0d1117", border:"1px solid #21262d", borderRadius:10, padding:20, marginBottom:16 }}>
          <div style={{ fontSize:10, color:"#6b7280", textTransform:"uppercase", fontFamily:"monospace", marginBottom:12 }}>Today's Games</div>

          {gamesLoading && <div style={{ color:"#6b7280" }}>Loading games...</div>}
          {gamesError && <div style={{ color:"#f87171" }}>Error: {gamesError}</div>}
          {!gamesLoading && games.length === 0 && <div style={{ color:"#6b7280" }}>No games today</div>}

          {games.map((g, i) => (
            <button key={i} onClick={() => setSelectedGame(g)}
              style={{
                display:"block", width:"100%", textAlign:"left",
                background: selectedGame?.game_pk === g.game_pk ? "#161b22" : "#010409",
                border: selectedGame?.game_pk === g.game_pk ? "1px solid #388bfd" : "1px solid #21262d",
                borderRadius:8, padding:"12px 16px", marginBottom:8, cursor:"pointer",
              }}>
              <div style={{ fontWeight:700, color:"#e6edf3" }}>{g.away_team} @ {g.home_team}</div>
              <div style={{ fontSize:11, color:"#6b7280", marginTop:3 }}>{g.away_pitcher_name} vs {g.home_pitcher_name}</div>
            </button>
          ))}

          {selectedGame && step !== "fetching" && (
            <button onClick={analyze} style={{ width:"100%", padding:"12px", background:"#388bfd", border:"none", borderRadius:8, color:"#fff", fontWeight:700, cursor:"pointer", marginTop:12 }}>
              ⚡ Analyze F5 ML
            </button>
          )}
        </div>

        {step === "fetching" && (
          <div style={{ background:"#0d1117", border:"1px solid #21262d", borderRadius:10, padding:24 }}>
            <Spinner />
            {log.map((l, i) => (
              <div key={i} style={{ fontFamily:"monospace", fontSize:12, color:"#c9d1d9", marginTop:8 }}>{l}</div>
            ))}
          </div>
        )}

        {step === "result" && result && ec && (
          <div style={{ background:ec.bg, border:`1px solid ${ec.border}`, borderRadius:12, padding:24 }}>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:26, fontWeight:800, color:ec.text }}>{result.pick}</div>
              <div style={{ fontSize:10, color:"#6b7280", marginTop:3 }}>Confidence: {result.confidence}/10</div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:14 }}>
              <StatBox label={`${result.away.team} Win%`} value={`${result.win_prob?.away}%`} />
              <StatBox label="Push%" value={`${result.win_prob?.push}%`} />
              <StatBox label={`${result.home.team} Win%`} value={`${result.win_prob?.home}%`} />
            </div>

            <button onClick={reset} style={{ width:"100%", padding:"12px", background:"#161b22", border:"1px solid #21262d", borderRadius:8, color:"#8b949e", cursor:"pointer" }}>
              Analyze Another Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
}