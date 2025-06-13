import { useEffect, useState } from "react";
import type { Player, Winner, Room } from "../types/game";
import { supabase } from "../utils/supabase";
import { getWinner } from "../utils/getWinner";
import { createEmptyBoard } from "../utils/createEmptyBoard";
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
import { getCalculatedStyles, containerStyle } from "../styles/styles";

import { useRoom } from "../hooks/useRoom";
import { useRoomSubscription } from "../hooks/useRoomSubscription";

import { GameOverlay } from "./GameOverlay";
import { PlayerInfo } from "./PlayerInfo";
import { StatsPanel } from "./StatsPanel";
import { GameControls } from "./GameControls";
import { GameGrid } from "./GameGrid";

export function Board() {
  const [board, setBoard] = useState<Player[][]>(startingBoard);
  const [isPlayer, setPlayer] = useState<Player>(startingPlayer);
  const [isWinner, setWinner] = useState<Winner>(startingWinner);
  const [boardSize, setBoardSize] = useState(startingBoardSize);
  const [isGameOver, setGameOver] = useState(startingGameOverFlag);
  const [stats, setStats] = useState(startingStats);
  const [isLoading, setIsLoading] = useState(defaultIsLoadingState);
  const [room, setRoom] = useState<Room | null>(null);

  const { roomCode, playerId, playerSymbol, handleHostRoom, handleJoinRoom } =
    useRoom({
      boardSize,
      setBoard,
      setBoardSize,
      setRoom,
      setIsLoading,
    });

  useRoomSubscription({
    roomCode,
    onUpdate: (updated) => {
      if (!updated) return;
      if (updated.board_state) setBoard(updated.board_state);
      if (updated.board_size) setBoardSize(updated.board_size);
      if (updated.current_turn) setPlayer(updated.current_turn);
      if (updated.winner) setWinner(updated.winner);
      if (typeof updated.is_game_over === "boolean")
        setGameOver(updated.is_game_over);
    },
  });

  useEffect(() => {
    async function loadStats() {
      setIsLoading(true);
      const { data, error } = await supabase.from("stats").select("X, O, Draw");
      if (error || !data) {
        console.error("Failed to load stats", error);
        setIsLoading(false);
        return;
      }
      const aggregated = data.reduce(
        (acc, row) => ({
          X: acc.X + (row.X || 0),
          O: acc.O + (row.O || 0),
          Draw: acc.Draw + (row.Draw || 0),
        }),
        { X: 0, O: 0, Draw: 0 }
      );
      setStats(aggregated);
      setIsLoading(false);
    }
    loadStats();
  }, []);

  useEffect(() => {
    setBoard(createEmptyBoard(boardSize));
  }, [boardSize]);

  const handleClick = async (row: number, col: number) => {
    if (!roomCode || board[row][col] || isGameOver) return;
    if (
      (isPlayer === "X" && room?.player_x !== playerId) ||
      (isPlayer === "O" && room?.player_o !== playerId)
    )
      return;

    const newBoard = board.map((r) => [...r]);
    newBoard[row][col] = isPlayer;

    const winner = getWinner({ board: newBoard, boardSize });
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
    } finally {
      setIsLoading(false);
    }
  };

  const clearStats = async () => {
    setIsLoading(true);
    try {
      await supabase.from("stats").delete().neq("id", "");
      setStats(startingStats);
    } catch (err) {
      console.error("Error clearing stats:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => clearStats();

  const handleIncreaseBoard = () =>
    setBoardSize((prev) => Math.min(prev + 1, maxBoardSize));
  const handleDecreaseBoard = () =>
    setBoardSize((prev) => Math.max(prev - 1, minBoardSize));

  const calculatedStyles = getCalculatedStyles({ boardSize, isLoading });

  return (
    <div style={containerStyle} className="gameBoard">
      {isLoading && <GameOverlay />}
      <div style={calculatedStyles.controlsWrapperStyle}>
        <PlayerInfo
          playerId={playerId}
          room={room}
          roomCode={roomCode}
          playerSymbol={playerSymbol}
          isWinner={isWinner}
          isGameOver={isGameOver}
        />
      </div>
      <StatsPanel draws={stats.Draw} />
      <GameControls
        onHost={handleHostRoom}
        onJoin={handleJoinRoom}
        onReset={handleReset}
        onIncrease={handleIncreaseBoard}
        onDecrease={handleDecreaseBoard}
        isLoading={isLoading}
      />
      <GameGrid
        board={board}
        onClick={handleClick}
        style={calculatedStyles.squareStyle}
      />
    </div>
  );
}
