import React, { useState } from "react";

// CONSTANTS
const BOARD_SIZE = 4;
const startingBoard: Board = Array(BOARD_SIZE)
  .fill(null)
  .map(() => Array(BOARD_SIZE).fill(null));
const startingPlayer = "X";
const startingWinner = "None";

// Styles

const squareStyle: React.CSSProperties = {
  aspectRatio: 1,
  backgroundColor: "#ddd",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontSize: "clamp(16px, 4vw, 24px",
  color: "white",
};

const boardStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
  gap: "4px",
  width: "min(90vw, 500px",
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

type Player = "X" | "O" | null | "--";
type Winner = Exclude<Player, null | "--"> | "Draw" | "None";
type Board = Player[][];

function getWinner(board: Board): Winner {
  for (let row = 0; row < BOARD_SIZE; row++) {
    const firstRowCell = board[row][0];
    if (
      firstRowCell !== null &&
      firstRowCell !== "--" &&
      board[row].every((cell) => cell === firstRowCell)
    )
      return firstRowCell;
  }

  for (let col = 0; col < BOARD_SIZE; col++) {
    const firstColCell = board[0][col];
    if (
      firstColCell !== null &&
      firstColCell !== "--" &&
      board.every((row) => row[col] === firstColCell)
    )
      return firstColCell;
  }

  if (
    board[0][0] !== null &&
    board[0][0] !== "--" &&
    board.every((row, col) => row[col] === board[0][0])
  ) {
    return board[0][0];
  }
  if (
    board[0][BOARD_SIZE - 1] !== null &&
    board[0][BOARD_SIZE - 1] !== "--" &&
    board.every(
      (row, col) => row[BOARD_SIZE - 1 - col] === board[0][BOARD_SIZE - 1]
    )
  ) {
    return board[0][BOARD_SIZE - 1];
  }

  return "None";
}

// Components

function Square({
  value,
  onClick,
  style,
}: {
  value: Player;
  onClick: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <div className="square" style={style} onClick={onClick}>
      {value}
    </div>
  );
}

function Board() {
  const [board, setBoard] = useState<Player[][]>(startingBoard);
  const [isPlayer, setPlayer] = useState<Player>(startingPlayer);
  const [isWinner, setWinner] = useState<Winner>(startingWinner);

  const handleClick = (row: number, col: number) => {
    if (board[row][col] || isWinner !== "None") return;

    const newBoard = board.map((r) => [...r]);

    newBoard[row][col] = isPlayer;
    setBoard(newBoard);
    setPlayer(isPlayer === "O" ? "X" : "O");
    const winner: Winner = getWinner(newBoard);
    setWinner(winner);
  };

  const handleReset = () => {
    setBoard(startingBoard);
    setPlayer(startingPlayer);
    setWinner(startingWinner);
  };

  return (
    <div style={containerStyle} className="gameBoard">
      <div id="statusArea" className="status" style={instructionsStyle}>
        Next player: <span>{isPlayer}</span>
      </div>
      <div id="winnerArea" className="winner" style={instructionsStyle}>
        Winner: <span>{isWinner}</span>
      </div>
      <button style={buttonStyle} onClick={handleReset}>
        Reset
      </button>
      <div style={boardStyle}>
        {board.flatMap((row, rowI) =>
          row.map((col, colI) => (
            <Square
              key={`${rowI}-${colI}`}
              value={col}
              onClick={() => handleClick(rowI, colI)}
              style={squareStyle}
            />
          ))
        )}
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

// {Array.from({ length: BOARD_SIZE }, (_, row) => (
//   <div key={row} className="board-row" style={rowStyle}>
//     {Array.from({ length: BOARD_SIZE }, (_, col) => (
//       <Square
//         key={col}
//         value={board[row][col]}
//         onClick={() => handleClick(row, col)}
//       />
//     ))}
