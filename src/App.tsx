import React, { useState } from "react";

// Styles
const rowStyle = {
  display: "flex",
};

const squareStyle = {
  width: "60px",
  height: "60px",
  backgroundColor: "#ddd",
  margin: "4px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontSize: "20px",
  color: "white",
};

const boardStyle = {
  backgroundColor: "#eee",
  width: "208px",
  display: "flex",
  flexDirection: "column" as const,
  border: "3px #eee solid",
};

const containerStyle = {
  display: "flex",
  alignItems: "center",
  flexDirection: "column" as const,
};

const instructionsStyle = {
  marginTop: "5px",
  marginBottom: "5px",
  fontWeight: "bold" as const,
  fontSize: "16px",
};

const buttonStyle = {
  marginTop: "15px",
  marginBottom: "16px",
  width: "80px",
  height: "40px",
  backgroundColor: "#8acaca",
  color: "white",
  fontSize: "16px",
};

// Components
type Player = "X" | "O" | null;

function Square({ value, onClick }: { value: Player; onClick: () => void }) {
  return (
    <div className="square" style={squareStyle} onClick={onClick}>
      {value}
    </div>
  );
}

function Board() {
  const [board, setBoard] = useState<Player[][]>([
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ]);
  const [isXNext, setIsXNext] = useState(true);

  const handleClick = (row: number, col: number) => {
    if (board[row][col]) return;
    const newBoard = board.map((r) => [...r]);
    newBoard[row][col] = isXNext ? "X" : "O";
    setBoard(newBoard);
    setIsXNext(!isXNext);
  };

  return (
    <div style={containerStyle} className="gameBoard">
      <div id="statusArea" className="status" style={instructionsStyle}>
        Next player: <span>{isXNext ? "X" : "O"}</span>
      </div>
      <div id="winnerArea" className="winner" style={instructionsStyle}>
        Winner: <span>None</span>
      </div>
      <button
        style={buttonStyle}
        onClick={() =>
          setBoard([
            [null, null, null],
            [null, null, null],
            [null, null, null],
          ])
        }
      >
        Reset
      </button>
      <div style={boardStyle}>
        {[0, 1, 2].map((row) => (
          <div key={row} className="board-row" style={rowStyle}>
            {[0, 1, 2].map((col) => (
              <Square
                key={col}
                value={board[row][col]}
                onClick={() => handleClick(row, col)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="game">
      <div className="game-board">
        <Board />
      </div>
    </div>
  );
}
