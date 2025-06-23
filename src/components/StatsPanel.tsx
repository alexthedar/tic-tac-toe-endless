import { instructionsStyle } from "../styles/styles";

interface PlayerStats {
  wins: number;
  losses: number;
  draws: number;
}

interface StatsPanelProps {
  stats: {
    X: PlayerStats;
    O: PlayerStats;
  };
}

export function StatsPanel({ stats }: StatsPanelProps) {
  console.log("🚀 ~ StatsPanel ~ stats:", stats);
  return (
    <div
      style={{
        ...instructionsStyle,
        textAlign: "center",
        display: "flex",
        justifyContent: "space-evenly",
        width: "100%",
      }}
    >
      <div>
        <strong>Player X</strong>
        <div>Wins: {stats.X.wins}</div>
        <div>Losses: {stats.X.losses}</div>
        <div>Draws: {stats.X.draws}</div>
      </div>
      <div>
        <strong>Player O</strong>
        <div>Wins: {stats.O.wins}</div>
        <div>Losses: {stats.O.losses}</div>
        <div>Draws: {stats.O.draws}</div>
      </div>
    </div>
  );
}
