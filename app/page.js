'use client';
import { useState, useEffect } from "react";

async function fetchOddsSharkData() {
  try {
    const res = await fetch('/api/scrape-oddsshark');
    if (!res.ok) throw new Error('Failed to fetch OddsShark data');
    return res.json();
  } catch (e) {
    console.error('OddsShark fetch error:', e);
    return null;
  }
}

const EDGE_COLORS = {
  "Strong Lean": { bg: "#0f3d2a", border: "#22c55e", text: "#4ade80", badge: "#166534" },
  "Lean": { bg: "#1a3a1a", border: "#86efac", text: "#86efac", badge: "#14532d" },
  "Slight Edge": { bg: "#1e2a1e", border: "#4ade80", text: "#6ee7b7", badge: "#14532d" },
  "Too Close": { bg: "#1a1a2e", border: "#6366f1", text: "#a5b4fc", badge: "#3730a3" },
  "Pass": { bg: "#1c1a1a", border: "#6b7280", text: "#9ca3af", badge: "#374151" },
};

function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 0" }}>
      <div style={{ width: 36, height: 36, border: "3px solid #21262d", borderTop: "3px solid #388bfd", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
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
        game_time: