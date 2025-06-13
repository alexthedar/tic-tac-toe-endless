import { instructionsStyle } from "../styles/styles";

export function StatsPanel({ draws }: { draws: number }) {
  return (
    <>
      <div style={instructionsStyle}>Player X Draws: {draws}</div>
      <div style={instructionsStyle}>Player O Draws: {draws}</div>
    </>
  );
}
