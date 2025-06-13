import { useEffect, useState } from "react";
import type { Player, Winner, Room } from "../types/game";
import { supabase } from "../utils/supabase";
import { Square } from "./Square";
import {
  getCalculatedStyles,
  containerStyle,
  instructionsStyle,
  winnerStyle,
  nextPlayerStyle,
  buttonGroupStyle,
  buttonStyle,
} from "../styles/styles";
import {
  startingBoard,
  startingPlayer,
  startingWinner,
  startingBoardSize,
  startingGameOverFlag,
  startingStats,
  defaultIsLoadingState,
  maxBoardSize,
  minBoardSize,
} from "../utils/constants";
import { createRoom } from "../utils/createRoom";
import { getOrCreatePlayerId } from "../utils/getOrCreatePlayerId";
import { createEmptyBoard } from "../utils/createEmptyBoard";
import { getWinner } from "../utils/getWinner";

export function Board() {
  const playerId = getOrCreatePlayerId();
  const [board, setBoard] = useState<Player[][]>(startingBoard);
  const [isPlayer, setPlayer] = useState<Player>(startingPlayer);
  const [isWinner, setWinner] = useState<Winner>(startingWinner);
  const [boardSize, setBoardSize] = useState(startingBoardSize);
  const [isGameOver, setGameOver] = useState(startingGameOverFlag);
  const [stats, setStats] = useState(startingStats);
  const [isLoading, setIsLoading] = useState(defaultIsLoadingState);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [room, setRoom] = useState<Room | null>(null);

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

  const handleClick = async (row: number, col: number) => {
    if (!roomCode || board[row][col] || isGameOver) return;
    if (
      (isPlayer === "X" && room?.player_x !== playerId) ||
      (isPlayer === "O" && room?.player_o !== playerId)
    )
      return;

    const newBoard = board.map((r) => [...r]);
    newBoard[row][col] = isPlayer;

    const winner: Winner = getWinner({ board: newBoard, boardSize });
    const nextTurn: Player = isPlayer === "X" ? "O" : "X";
    const gameOver = winner !== "None";

    setIsLoading(true);
    try {
      await supabase
        .from("rooms")
        .update({
          board_state: newBoard,
          current_turn: gameOver ? null : nextTurn,
          winner: gameOver ? winner : null,
          is_game_over: gameOver,
        })
        .eq("code", roomCode);
      setBoard(newBoard);
      setPlayer(gameOver ? "--" : nextTurn);
      setWinner(winner);
      setGameOver(gameOver);
    } catch (error) {
      console.error("Failed to update move:", error);
    }
  };

  const handleHostRoom = async () => {
    setIsLoading(true);
    const roomCode = await createRoom({ boardSize, playerId });
    if (!roomCode) {
      alert("Failed to create room code");
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .eq("code", roomCode)
      .single();

    if (error || !data) {
      alert("Failed to load room after creation.");
      console.error("Room fetch error:", error);
      setIsLoading(false);
      return;
    }

    setBoard(data.board_state);
    setBoardSize(data.board_size);
    setPlayer("X");
    setWinner(data.winner || "None");
    setGameOver(data.is_game_over);
    setRoomCode(roomCode);
    setIsLoading(false);
    setRoom(data as Room);
    alert(`Room created. Share code: ${roomCode}`);
  };
  const handleJoinGame = async () => {
    const code = prompt("Enter 6-character room code:");
    if (!code) return;

    setIsLoading(true);

    const { data: initialData, error: fetchError } = await supabase
      .from("rooms")
      .select("*")
      .eq("code", code)
      .single();

    if (fetchError || !initialData) {
      alert("Room not found.");
      console.error("Join error:", fetchError);
      setIsLoading(false);
      return;
    }

    const updateField =
      initialData.player_x === null || initialData.player_x === playerId
        ? "player_x"
        : initialData.player_o === null || initialData.player_o === playerId
        ? "player_o"
        : null;

    if (!updateField) {
      alert("Room is full");
      setIsLoading(false);
      return;
    }

    try {
      await supabase
        .from("rooms")
        .update({ [updateField]: playerId })
        .eq("code", code);

      const { data: updatedRoom, error: refetchError } = await supabase
        .from("rooms")
        .select("*")
        .eq("code", code)
        .single();

      if (refetchError || !updatedRoom) {
        alert("Failed to sync room after joining.");
        console.error("Refetch error:", refetchError);
        setIsLoading(false);
        return;
      }

      const mySymbol = updateField === "player_x" ? "X" : "O";
      setBoard(updatedRoom.board_state);
      setBoardSize(updatedRoom.board_size);
      setPlayer(mySymbol);
      setWinner(updatedRoom.winner || "None");
      setGameOver(updatedRoom.is_game_over);
      setRoomCode(code);
      setRoom(updatedRoom as Room);
    } catch (error) {
      alert("Failed to join room.");
      console.error("Join update error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    clearStats();
    // handleNewGame();
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
        <div style={instructionsStyle}>
          You are: <strong>{playerId}</strong> (
          {room?.player_x === playerId
            ? "X"
            : room?.player_o === playerId
            ? "O"
            : "Spectator"}
          )
        </div>
        <div style={instructionsStyle}>
          {isGameOver
            ? "Game over"
            : room &&
              (room.current_turn === (room.player_x === playerId ? "X" : "O")
                ? "Your turn"
                : "Waiting for opponent")}
        </div>
        <div id="winnerArea" className="winner" style={winnerStyle}>
          Winner: <span>{isWinner}</span>
        </div>
        <div style={instructionsStyle}>Room: {roomCode}</div>
        <div id="statusArea" className="status" style={nextPlayerStyle}>
          Next player: <span>{isPlayer}</span>
        </div>
      </div>
      <div style={calculatedStyles.controlsWrapperStyle}>
        <div style={instructionsStyle}>Player: PLAYER ID is X</div>
        {/* <div style={instructionsStyle}>Wins: {stats.Wins}</div> */}
        <div style={instructionsStyle}>Draws: {stats.Draw}</div>
        {/* <div style={instructionsStyle}>Loss: {stats.Loss}</div> */}
      </div>
      <div style={calculatedStyles.controlsWrapperStyle}>
        <div style={instructionsStyle}>Player: PLAYER ID is O</div>
        {/* <div style={instructionsStyle}>Wins: {stats.Wins}</div> */}
        <div style={instructionsStyle}>Draws: {stats.Draw}</div>
        {/* <div style={instructionsStyle}>Loss: {stats.Loss}</div> */}
      </div>
      <div style={buttonGroupStyle}>
        {["+", "Host", "Join", "Reset", "-"].map((label) => {
          if (label === "Reset" || !isLoading) {
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
                disabled={isLoading || label === "+" || label === "-"}
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
