import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bracket, Seed, SeedItem, SeedTeam } from "react-tournament-bracket";

const TournamentBracket = ({ tournamentId }) => {
  const [bracket, setBracket] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!tournamentId) return;

    const fetchBracket = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/tournaments/${tournamentId}/bracket`);
        if (res.data.bracket.length === 0) {
          setError("No bracket data available.");
        } else {
          setBracket(res.data.bracket);
        }
      } catch (err) {
        console.error("❌ Error fetching bracket:", err);
        setError("Failed to load bracket.");
      } finally {
        setLoading(false);
      }
    };

    fetchBracket();
  }, [tournamentId]);

  return (
    <div>
      <h2>Tournament Bracket</h2>

      {loading ? (
        <p>Loading bracket...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        bracket.map((round, roundIndex) => (
          <div key={roundIndex} className="round">
            <h3>Round {round.round}</h3>

            {round.matchups.map((matchup, matchupIndex) => (
              <Seed key={matchupIndex}>
                <SeedItem>
                  <SeedTeam>{matchup.player1 || "TBA"}</SeedTeam>
                  <SeedTeam>{matchup.player2 || "TBA"}</SeedTeam>
                  <p>Winner: {matchup.winner || "TBD"}</p>
                </SeedItem>
              </Seed>
            ))}
          </div>
        ))
      )}
    </div>
  );
};

export default TournamentBracket;
