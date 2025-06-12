import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

// CONSTANTS
const startingBoardSize = 3;
const startingBoard: Board = Array(startingBoardSize)
  .fill(null)
  .map(() => Array(startingBoardSize).fill(null));
const startingPlayer = "X";
const startingWinner = "None";
const maxBoardSize = 10;
const minBoardSize = 3;
const startingStats = {
  X: 0,
  O: 0,
  Draw: 0,
};
const startingGameOverFlag = false;
const defaultIsLoadingState = false;
const defaultHasGameStarted = false;

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

const winnerStyle = {
  ...instructionsStyle,
  minWidth: "120px",
  textAlign: "left" as const,
};
const nextPlayerStyle = {
  ...instructionsStyle,
  minWidth: "120px",
  textAlign: "right" as const,
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

const buttonGroupStyle = {
  display: "flex",
  gap: "6px",
};

// Types
type Player = "X" | "O" | null | "--";
type Winner = Exclude<Player, null | "--"> | "Draw" | "None";
type Board = Player[][];

// helpers
async function createRoom(boardSize: number): Promise<string | null> {
  const board = createEmptyBoard(boardSize);

  const { data, error } = await supabase
    .from("rooms")
    .insert([
      {
        board_state: board,
        board_size: boardSize,
        current_turn: "X",
      },
    ])
    .select("code")
    .single();

  if (error) {
    console.error("Error creating room:", error);
    return null;
  }

  return data.code;
}

function getCalculatedStyles({
  boardSize,
  isLoading,
}: {
  boardSize: number;
  isLoading: boolean;
}) {
  const boardWidth = boardSize * 2 + 50;
  const squareVW = boardWidth / boardSize;

  const boardStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
    gap: `${Math.min(1, 3 / boardSize)}vw`,
    width: `${boardWidth}vw`,
  };
  const squareStyle = {
    aspectRatio: "1",
    backgroundColor: "#ddd",
    fontSize: `${squareVW * 0.5}vw`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    transition: "opacity 0.2s ease",
    opacity: isLoading ? 0.4 : 1,
    cursor: isLoading ? "not-allowed" : "pointer",
    pointerEvents: isLoading
      ? "none"
      : ("auto" as React.CSSProperties["pointerEvents"]),
  };
  const controlsWrapperStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
    width: `${boardWidth}vw`,
  };
  return {
    boardStyle,
    squareStyle,
    controlsWrapperStyle,
  };
}

function createEmptyBoard(size: number): Player[][] {
  return Array.from({ length: size }, () => Array(size).fill(null));
}

function isPlayable(cell: Player): cell is Exclude<Player, null | "--"> {
  return cell !== null && cell !== "--";
}

function getWinner({
  board,
  boardSize,
}: {
  board: Board;
  boardSize: number;
}): Winner {
  const firstBackSlashCell = board[0][0];
  const firstForwardSlashCell = board[boardSize - 1][0];

  for (let row = 0; row < boardSize; row++) {
    const firstRowCell = board[row][0];
    if (
      isPlayable(firstRowCell) &&
      board[row].every((cell) => cell === firstRowCell)
    )
      return firstRowCell;
  }

  for (let col = 0; col < boardSize; col++) {
    const firstColCell = board[0][col];
    if (
      isPlayable(firstColCell) &&
      board.every((row) => row[col] === firstColCell)
    )
      return firstColCell;
  }

  if (
    isPlayable(firstBackSlashCell) &&
    board.every((row, col) => row[col] === firstBackSlashCell)
  ) {
    return firstBackSlashCell;
  }
  if (
    isPlayable(firstForwardSlashCell) &&
    board.every(
      (row, col) => row[boardSize - 1 - col] === firstForwardSlashCell
    )
  ) {
    return firstForwardSlashCell;
  }

  const allFilled = board.flat().every((cell) => isPlayable(cell));
  if (allFilled) return "Draw";

  return "None";
}

// components
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
  const [isGameOver, setGameOver] = useState(startingGameOverFlag);
  const [stats, setStats] = useState(startingStats);
  const [isLoading, setIsLoading] = useState(defaultIsLoadingState);
  const [hasGameStarted, setHasGameStarted] = useState(defaultHasGameStarted);

  useEffect(() => {
    async function loadStats() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("stats")
          .select("X, O, Draw");

        if (error) {
          console.error("Supabase error loading stats:", error);
          return;
        }

        if (data && data.length) {
          const aggregated = data.reduce(
            (acc, row) => ({
              X: acc.X + (row.X || 0),
              O: acc.O + (row.O || 0),
              Draw: acc.Draw + (row.Draw || 0),
            }),
            { X: 0, O: 0, Draw: 0 }
          );
          setStats(aggregated);
        }
      } catch (err) {
        console.error("Unexpected error loading stats:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadStats();
  }, []);

  useEffect(() => {
    setBoard(createEmptyBoard(boardSize));
  }, [boardSize]);

  const clearStats = async () => {
    setIsLoading(true);
    try {
      await supabase.from("stats").delete().neq("id", "");
      setStats(startingStats);
    } catch (error) {
      console.error("Error clearing stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    setIsLoading(true);
    const code = await createRoom(boardSize);
    setIsLoading(false);

    if (code) {
      alert(`Room created! Share this code: ${code}`);
    } else {
      alert("Failed to create room.");
    }
  };

  const handleClick = async (row: number, col: number) => {
    if (board[row][col] || isGameOver) return;
    if (!hasGameStarted) {
      setHasGameStarted(true);
    }
    const newBoard = board.map((r) => [...r]);
    newBoard[row][col] = isPlayer;
    setBoard(newBoard);
    const winner: Winner = getWinner({ board: newBoard, boardSize });
    if (winner === "X" || winner === "O" || winner === "Draw") {
      setWinner(winner);
      setPlayer("--");
      setStats((prev) => ({ ...prev, [winner]: prev[winner] + 1 }));
      setGameOver(true);
      try {
        setIsLoading(true);
        await supabase.from("stats").insert([
          {
            X: winner === "X" ? 1 : 0,
            O: winner === "O" ? 1 : 0,
            Draw: winner === "Draw" ? 1 : 0,
          },
        ]);
      } catch (error: unknown) {
        console.error("Failed to insert stats:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setPlayer(isPlayer === "O" ? "X" : "O");
    }
  };

  const handleNewGame = () => {
    setBoard(createEmptyBoard(boardSize));
    setPlayer(startingPlayer);
    setWinner(startingWinner);
    setGameOver(false);
    setHasGameStarted(false);
  };

  const handleHostRoom = () => {};
  const handleJoinGame = () => {};

  const handleReset = () => {
    clearStats();
    handleNewGame();
  };

  const handleIncreaseBoard = () => {
    setBoardSize((prev) => Math.min(prev + 1, maxBoardSize));
  };
  const handleDecreaseBoard = () => {
    setBoardSize((prev) => Math.max(prev - 1, minBoardSize));
  };

  const calculatedStyles = getCalculatedStyles({ boardSize, isLoading });

  return (
    <div style={containerStyle} className="gameBoard">
      {isLoading && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            zIndex: 10,
          }}
        />
      )}

      <div style={calculatedStyles.controlsWrapperStyle}>
        <div style={instructionsStyle}>X Wins: {stats.X}</div>
        <div style={instructionsStyle}>Draws: {stats.Draw}</div>
        <div style={instructionsStyle}>O Wins: {stats.O}</div>
      </div>
      <div style={calculatedStyles.controlsWrapperStyle}>
        <div id="winnerArea" className="winner" style={winnerStyle}>
          Winner: <span>{isWinner}</span>
        </div>

        <div style={buttonGroupStyle}>
          {["+", "Host", "Join", "Reset", "-"].map((label) => {
            if (label === "Reset" || !hasGameStarted || isLoading) {
              const onClick = {
                "+": handleIncreaseBoard,
                "-": handleDecreaseBoard,
                Host: handleHostRoom,
                Join: handleJoinGame,
                Reset: handleReset,
              }[label];

              return (
                <button
                  key={label}
                  disabled={
                    isLoading ||
                    (hasGameStarted && (label === "+" || label === "-"))
                  }
                  style={buttonStyle}
                  onClick={onClick}
                >
                  {label}
                </button>
              );
            }
            return null;
          })}
        </div>
        <div id="statusArea" className="status" style={nextPlayerStyle}>
          Next player: <span>{isPlayer}</span>
        </div>
      </div>
      <div style={calculatedStyles.boardStyle}>
        {board.flatMap((row, rowI) =>
          row.map((col, colI) => (
            <Square
              key={`${rowI}-${colI}`}
              value={col}
              onClick={() => handleClick(rowI, colI)}
              style={calculatedStyles.squareStyle}
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
