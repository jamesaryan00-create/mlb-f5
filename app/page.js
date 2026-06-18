'use client';
import { useState, useEffect } from "react";

function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 0" }}>
      <div style={{ width: 36, height: 36, border: "3px solid rgba(56, 139, 253, 0.3)", borderTop: "3px solid #00d4aa", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function getToday() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

async function mlbFetch(endpoint) {
  const MLB_API = "https://statsapi.mlb.com/api/v1";
  const url = `${MLB_API}${endpoint}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`MLB API ${res.status}`);
  return res.json();
}

async function fetchOddsSharkData() {
  try {
    const res = await fetch('/oddsshark-data.json');
    if (!res.ok) throw new Error('Failed to fetch OddsShark data');
    return res.json();
  } catch (e) {
    console.error('OddsShark fetch error:', e);
    return null;
  }
}

export default function MLBF5Live() {
  const [games, setGames] = useState([]);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [gamesError, setGamesError] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [step, setStep] = useState("select");
  const [log, setLog] = useState([]);
  const [result, setResult] = useState(null);
  const [oddsSharkData, setOddsSharkData] = useState(null);

  const addLog = (msg) => setLog(prev => [...prev, msg]);

  useEffect(() => {
    loadGames();
    fetchOddsSharkData().then(data => setOddsSharkData(data));
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
        game_time: g.gameDateTime ? new Date(g.gameDateTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) + " ET" : "TBA",
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
      return { name: person.fullName || pitcherName, era: stat.era ? Number(stat.era).toFixed(2) : "—", whip: stat.whip ? Number(stat.whip).toFixed(2) : "—" };
    } catch (e) {
      return { name: pitcherName, era: "—", whip: "—" };
    }
  };

  const analyze = async () => {
    if (!selectedGame) return;

cat > ~/mlb-f5/app/page.js << 'PAGEFILE'
'use client';
import { useState, useEffect } from "react";

function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 0" }}>
      <div style={{ width: 36, height: 36, border: "3px solid rgba(56, 139, 253, 0.3)", borderTop: "3px solid #00d4aa", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function getToday() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

async function mlbFetch(endpoint) {
  const MLB_API = "https://statsapi.mlb.com/api/v1";
  const url = `${MLB_API}${endpoint}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`MLB API ${res.status}`);
  return res.json();
}

async function fetchOddsSharkData() {
  try {
    const res = await fetch('/oddsshark-data.json');
    if (!res.ok) throw new Error('Failed to fetch OddsShark data');
    return res.json();
  } catch (e) {
    console.error('OddsShark fetch error:', e);
    return null;
  }
}

export default function MLBF5Live() {
  const [games, setGames] = useState([]);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [gamesError, setGamesError] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [step, setStep] = useState("select");
  const [log, setLog] = useState([]);
  const [result, setResult] = useState(null);
  const [oddsSharkData, setOddsSharkData] = useState(null);

  const addLog = (msg) => setLog(prev => [...prev, msg]);

  useEffect(() => {
    loadGames();
    fetchOddsSharkData().then(data => setOddsSharkData(data));
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
        game_time: g.gameDateTime ? new Date(g.gameDateTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) + " ET" : "TBA",
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
      return { name: person.fullName || pitcherName, era: stat.era ? Number(stat.era).toFixed(2) : "—", whip: stat.whip ? Number(stat.whip).toFixed(2) : "—" };
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
      const ap = selectedGame.away_pitcher_id ? await fetchPitcherStats(selectedGame.away_pitcher_id, selectedGame.away_pitcher_name) : { name: selectedGame.away_pitcher_name, era: "—", whip: "—" };
      addLog(`✓ ${ap.name}: ERA ${ap.era}`);
      const hp = selectedGame.home_pitcher_id ? await fetchPitcherStats(selectedGame.home_pitcher_id, selectedGame.home_pitcher_name) : { name: selectedGame.home_pitcher_name, era: "—", whip: "—" };
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

      setResult({ edge, side, pick, confidence, win_prob, away: { team: selectedGame.away_team, ...ap }, home: { team: selectedGame.home_team, ...hp }, venue: selectedGame.venue, game_time: selectedGame.game_time });
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

  const today = getToday();

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a1428 0%, #1a2a4a 100%)", color: "#e6edf3", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .navbar { background: rgba(10, 20, 40, 0.95); border-bottom: 1px solid rgba(56, 139, 253, 0.2); padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; backdrop-filter: blur(10px); }
        .logo { font-size: 18px; font-weight: 700; color: #00d4aa; display: flex; align-items: center; gap: 8px; }
        .container { max-width: 1200px; margin: 0 auto; padding: 3rem 2rem; }
        h1 { font-size: 32px; font-weight: 700; margin-bottom: 1.5rem; }
        .games-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; }
        .game-card { background: rgba(30, 42, 66, 0.6); border: 1px solid rgba(56, 139, 253, 0.15); border-radius: 12px; padding: 1.5rem; cursor: pointer; transition: all 0.3s; }
        .game-card:hover { border-color: #00d4aa; background: rgba(30, 42, 66, 0.8); }
        .game-card.selected { border-color: #00d4aa; background: rgba(0, 212, 170, 0.08); }
        .game-matchup { font-size: 18px; font-weight: 700; margin-bottom: 1rem; color: #e6edf3; }
        .game-pitchers { font-size: 13px; color: #8b949e; margin-bottom: 1.5rem; line-height: 1.8; }
        .pitcher-item { display: flex; justify-content: space-between; margin-bottom: 6px; }
        .pitcher-era { color: #00d4aa; font-weight: 600; }
        .game-time { font-size: 12px; color: #6e7681; margin-top: 1rem; }
        .analyze-btn { width: 100%; padding: 12px; background: #00d4aa; color: #0a1428; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 1.5rem; font-size: 14px; }
        .analyze-btn:hover { background: #00e5bb; }
        .edge-badge { display: inline-block; padding: 8px 14px; border-radius: 6px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 1rem; }
        .edge-strong { background: rgba(0, 212, 170, 0.2); color: #00d4aa; border: 1px solid rgba(0, 212, 170, 0.4); }
        .edge-lean { background: rgba(0, 212, 170, 0.15); color: #00d4aa; }
        .edge-too-close { background: rgba(56, 139, 253, 0.15); color: #58a6ff; }
        .result-container { background: rgba(30, 42, 66, 0.6); border: 1px solid rgba(56, 139, 253, 0.2); border-radius: 12px; padding: 2.5rem; margin-bottom: 2rem; backdrop-filter: blur(10px); }
        .result-header { margin-bottom: 2rem; }
        .result-pick { font-size: 36px; font-weight: 700; color: #00d4aa; margin-bottom: 0.5rem; }
        .result-confidence { font-size: 14px; color: #8b949e; }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem; }
        .stat-box { background: rgba(0, 212, 170, 0.08); border: 1px solid rgba(0, 212, 170, 0.2); border-radius: 8px; padding: 1rem; text-align: center; }
        .stat-label { font-size: 12px; color: #6e7681; margin-bottom: 8px; text-transform: uppercase; }
        .stat-value { font-size: 22px; font-weight: 700; color: #e6edf3; }
        .pitcher-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
        .pitcher-card { background: rgba(10, 20, 40, 0.5); border: 1px solid rgba(56, 139, 253, 0.15); border-radius: 8px; padding: 1.2rem; }
        .pitcher-team { font-size: 12px; color: #8b949e; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
        .pitcher-name { font-size: 14px; font-weight: 600; color: #e6edf3; margin-bottom: 8px; }
        .pitcher-stat { font-size: 13px; color: #8b949e; margin-bottom: 4px; }
        .log-container { background: rgba(10, 20, 40, 0.7); border: 1px solid rgba(56, 139, 253, 0.15); border-radius: 8px; padding: 1.5rem; margin-bottom: 2rem; }
        .log-line { font-family: 'Courier New', monospace; font-size: 12px; color: #8b949e; line-height: 1.6; margin-bottom: 4px; }
        .log-success { color: #00d4aa; }
        .reset-btn { width: 100%; padding: 12px; background: rgba(56, 139, 253, 0.2); color: #58a6ff; border: 1px solid rgba(56, 139, 253, 0.4); border-radius: 8px; font-weight: 600; cursor: pointer; }
        .reset-btn:hover { background: rgba(56, 139, 253, 0.3); }
      `}</style>

      <div className="navbar">
        <div className="logo">⚾ MLB F5 ML Finder</div>
      </div>

      <div className="container">
        <h1>Find F5 <span style={{ color: "#00d4aa" }}>ML Edges</span></h1>

        {step === "select" && (
          <>
            {gamesLoading && <div style={{ color: "#8b949e" }}>Loading today's games...</div>}
            {gamesError && <div style={{ color: "#f85149" }}>Error: {gamesError}</div>}
            {!gamesLoading && games.length === 0 && <div style={{ color: "#8b949e" }}>No games today</div>}

            {games.length > 0 && (
              <>
                <div style={{ marginBottom: "1rem", color: "#8b949e", fontSize: "14px" }}>Select a game to analyze</div>
                <div className="games-grid">
                  {games.map((g, i) => (
                    <div key={i} className={`game-card ${selectedGame?.game_pk === g.game_pk ? "selected" : ""}`} onClick={() => setSelectedGame(g)}>
                      <div className="game-matchup">{g.away_team} @ {g.home_team}</div>
                      <div className="game-pitchers">
                        <div className="pitcher-item">
                          <span>{g.away_pitcher_name}</span>
                        </div>
                        <div className="pitcher-item">
                          <span>{g.home_pitcher_name}</span>
                        </div>
                      </div>
                      <div className="game-time">{g.game_time}</div>
                    </div>
                  ))}
                </div>

                {selectedGame && (
                  <button className="analyze-btn" onClick={analyze}>⚡ Analyze F5 ML</button>
                )}
              </>
            )}
          </>
        )}

        {step === "fetching" && (
          <div className="log-container">
            <Spinner />
            {log.map((l, i) => (
              <div key={i} className={`log-line ${l.includes("✓") ? "log-success" : ""}`}>{l}</div>
            ))}
          </div>
        )}

        {step === "result" && result && (
          <div className="result-container">
            <div className="result-header">
              <div className="result-pick">{result.pick}</div>
              <div className="result-confidence">Confidence: {result.confidence}/10</div>
            </div>

            <div className="stats-grid">
              <div className="stat-box">
                <div className="stat-label">{result.away.team} Win%</div>
                <div className="stat-value">{result.win_prob.away}%</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Push%</div>
                <div className="stat-value">{result.win_prob.push}%</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">{result.home.team} Win%</div>
                <div className="stat-value">{result.win_prob.home}%</div>
              </div>
            </div>

            <div className="pitcher-cards">
              <div className="pitcher-card">
                <div className="pitcher-team">{result.away.team}</div>
                <div className="pitcher-name">{result.away.name}</div>
                <div className="pitcher-stat">ERA: {result.away.era}</div>
                <div className="pitcher-stat">WHIP: {result.away.whip}</div>
              </div>
              <div className="pitcher-card">
                <div className="pitcher-team">{result.home.team}</div>
                <div className="pitcher-name">{result.home.name}</div>
                <div className="pitcher-stat">ERA: {result.home.era}</div>
                <div className="pitcher-stat">WHIP: {result.home.whip}</div>
              </div>
            </div>

            <button className="reset-btn" onClick={reset}>← Analyze Another Game</button>
          </div>
        )}
      </div>
    </div>
  );
}
