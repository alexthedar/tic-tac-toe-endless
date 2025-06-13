import { Square } from "./Square";
import type { Player } from "../types/game";

interface GameGridProps {
  board: Player[][];
  onClick: (row: number, col: number) => void;
  style: React.CSSProperties;
}

export function GameGrid({ board, onClick, style }: GameGridProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${board.length}, 1fr)`,
        gap: `${Math.min(1, 3 / board.length)}vw`,
        width: `${board.length * 2 + 50}vw`,
      }}
    >
      {board.map((row, rowI) =>
        row.map((cell, colI) => (
          <Square
            key={`${rowI}-${colI}`}
            value={cell}
            onClick={() => onClick(rowI, colI)}
            style={style}
          />
        ))
      )}
    </div>
  );
}
