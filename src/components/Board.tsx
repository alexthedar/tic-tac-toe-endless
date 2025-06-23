import { useState, useCallback } from "react";
import type { Player, Winner, Room } from "../types/game";
import { supabase } from "../utils/supabase";
import { getWinner } from "../utils/getWinner";
import {
  startingBoard,
  startingPlayer,
  startingWinner,
  startingBoardSize,
  startingGameOverFlag,
  defaultIsLoadingState,
  maxBoardSize,
  minBoardSize,
} from "../utils/constants";
import { getCalculatedStyles, containerStyle } from "../styles/styles";

import { useRoom } from "../hooks/useRoom";
import { useRoomSubscription } from "../hooks/useRoomSubscription";

import { GameOverlay } from "./GameOverlay";
import { PlayerInfo } from "./PlayerInfo";
import { GameControls } from "./GameControls";
import { GameGrid } from "./GameGrid";

export function Board() {
  const [room, setRoom] = useState<Room | null>(null);
  const [board, setBoard] = useState<Player[][]>(startingBoard);
  const [currentPlayer, setCurrentPlayer] = useState<Player>(startingPlayer);
  const [winner, setWinner] = useState<Winner>(startingWinner);
  const [isGameOver, setGameOver] = useState(startingGameOverFlag);
  const [boardSize, setBoardSize] = useState(startingBoardSize);
  const [isLoading, setIsLoading] = useState(defaultIsLoadingState);

  const updateLocalStateFromRoom = useCallback(
    (updatedRoom: Room | Partial<Room> | null) => {
      if (!updatedRoom) return;

      setRoom((prevRoom) => {
        const newRoom = { ...(prevRoom || {}), ...updatedRoom } as Room;

        setBoard(newRoom.board_state);
        setBoardSize(newRoom.board_size);
        setCurrentPlayer(newRoom.current_turn || "--");
        setWinner(newRoom.winner || "None");
        setGameOver(newRoom.is_game_over);

        return newRoom;
      });
    },
    []
  );

  const { playerId, playerSymbol, roomCode, handleHostRoom, handleJoinRoom } =
    useRoom({
      onRoomUpdate: updateLocalStateFromRoom,
      setIsLoading,
    });

  useRoomSubscription({
    roomCode,
    onUpdate: updateLocalStateFromRoom,
  });

  const handleClick = async (row: number, col: number) => {
    if (!roomCode || !room || board[row][col] || isGameOver) return;
    if (
      (currentPlayer === "X" && room.player_x !== playerId) ||
      (currentPlayer === "O" && room.player_o !== playerId)
    )
      return;

    const newBoard = board.map((r) => [...r]);
    newBoard[row][col] = currentPlayer;

    const newWinner = getWinner({ board: newBoard, boardSize });
    const nextTurn: Player = currentPlayer === "X" ? "O" : "X";
    const newGameOver = newWinner !== "None";

    setIsLoading(true);
    try {
      await supabase
        .from("rooms")
        .update({
          board_state: newBoard,
          current_turn: newGameOver ? null : nextTurn,
          winner: newGameOver ? newWinner : null,
          is_game_over: newGameOver,
        })
        .eq("code", roomCode);
    } catch (error) {
      console.error("Failed to update move:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHost = () => handleHostRoom(boardSize);
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
          isWinner={winner}
          isGameOver={isGameOver}
        />
      </div>
      <GameControls
        onHost={handleHost}
        onJoin={handleJoinRoom}
        onReset={() => {}}
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
