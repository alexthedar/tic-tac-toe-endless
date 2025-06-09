import React, { useEffect, useState } from "react";

// CONSTANTS
const startingBoardSize = 3;
const startingBoard: Board = Array(startingBoardSize)
  .fill(null)
  .map(() => Array(startingBoardSize).fill(null));
const startingPlayer = "X";
const startingWinner = "None";
const maxBoardSize = 10;
const minBoardSize = 3;

// Styles

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

function getBoardStyle(boardSize: number): React.CSSProperties {
  return {
    display: "grid",
    gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
    gap: "4px",
    width: "min(90vw, 500px)",
  };
}

function getSquareStyle(boardSize: number): React.CSSProperties {
  const fontSize = Math.max(12, Math.floor(160 / boardSize));
  return {
    aspectRatio: "1",
    backgroundColor: "#ddd",
    fontSize: `${fontSize}px`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
  };
}

function getWinner({
  board,
  boardSize,
}: {
  board: Board;
  boardSize: number;
}): Winner {
  for (let row = 0; row < boardSize; row++) {
    const firstRowCell = board[row][0];
    if (
      firstRowCell !== null &&
      firstRowCell !== "--" &&
      board[row].every((cell) => cell === firstRowCell)
    )
      return firstRowCell;
  }

  for (let col = 0; col < boardSize; col++) {
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
    board[0][boardSize - 1] !== null &&
    board[0][boardSize - 1] !== "--" &&
    board.every(
      (row, col) => row[boardSize - 1 - col] === board[0][boardSize - 1]
    )
  ) {
    return board[0][boardSize - 1];
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
  const [boardSize, setBoardSize] = useState(startingBoardSize);

  useEffect(() => {
    setBoard(
      Array.from({ length: boardSize }, () => Array(boardSize).fill(null))
    );
  }, [boardSize]);

  const handleClick = (row: number, col: number) => {
    if (board[row][col] || isWinner !== "None") return;

    const newBoard = board.map((r) => [...r]);

    newBoard[row][col] = isPlayer;
    setBoard(newBoard);
    setPlayer(isPlayer === "O" ? "X" : "O");
    const winner: Winner = getWinner({ board: newBoard, boardSize });
    setWinner(winner);
  };

  const handleReset = () => {
    setBoard(startingBoard);
    setPlayer(startingPlayer);
    setWinner(startingWinner);
  };

  const handleIncreaseBoard = () => {
    setBoardSize((prev) => Math.min(prev + 1, maxBoardSize));
    setBoard(
      Array.from({ length: boardSize }, () => Array(boardSize).fill(null))
    );
  };
  const handleDecreaseBoard = () => {
    setBoardSize((prev) => Math.max(prev - 1, minBoardSize));
  };

  return (
    <div style={containerStyle} className="gameBoard">
      <div id="statusArea" className="status" style={instructionsStyle}>
        Next player: <span>{isPlayer}</span>
      </div>
      <div id="winnerArea" className="winner" style={instructionsStyle}>
        Winner: <span>{isWinner}</span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginTop: "16px",
        }}
      >
        <button style={buttonStyle} onClick={handleIncreaseBoard}>
          +
        </button>
        <button style={buttonStyle} onClick={handleReset}>
          Reset
        </button>
        <button style={buttonStyle} onClick={handleDecreaseBoard}>
          -
        </button>
      </div>
      <div style={getBoardStyle(boardSize)}>
        {board.flatMap((row, rowI) =>
          row.map((col, colI) => (
            <Square
              key={`${rowI}-${colI}`}
              value={col}
              onClick={() => handleClick(rowI, colI)}
              style={getSquareStyle(boardSize)}
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
