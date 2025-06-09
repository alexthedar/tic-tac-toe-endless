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

type Player = "X" | "O" | null | "--";
type Winner = Exclude<Player, null | "--"> | "Draw" | "None";
type Board = Player[][];

// CONSTANTS
const BOARD_SIZE = 3;
const startingBoard: Board = Array(3)
  .fill(null)
  .map(() => Array(3).fill(null));
const startingPlayer = "X";
const startingWinner = "None";

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
    board[0][0] === board[1][1] &&
    board[1][1] === board[2][2]
  ) {
    return board[0][0];
  }
  if (
    board[0][2] !== null &&
    board[0][2] !== "--" &&
    board[0][2] === board[1][1] &&
    board[1][1] === board[2][0]
  ) {
    return board[0][2];
  }

  return "None";
}

// Components

function Square({ value, onClick }: { value: Player; onClick: () => void }) {
  return (
    <div className="square" style={squareStyle} onClick={onClick}>
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
