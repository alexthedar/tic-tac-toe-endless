import { useState, useCallback } from "react";
import { supabase } from "../utils/supabase";
import { createRoom } from "../utils/createRoom";
import { getOrCreatePlayerId } from "../utils/getOrCreatePlayerId";
import type { Board, Room } from "../types/game";

interface UseRoomArgs {
  boardSize: number;
  setBoard: (board: Board) => void;
  setBoardSize: (size: number) => void;
  setRoom: (room: Room) => void;
  setIsLoading: (loading: boolean) => void;
}

export function useRoom({
  boardSize,
  setBoard,
  setBoardSize,
  setRoom,
  setIsLoading,
}: UseRoomArgs) {
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [room, _setInternalRoom] = useState<Room | null>(null);
  const [playerSymbol, setPlayerSymbol] = useState<"X" | "O" | null>(null);
  const playerId = getOrCreatePlayerId();

  const handleHostRoom = useCallback(async () => {
    setIsLoading(true);
    const code = await createRoom({ boardSize, playerId });
    if (!code) {
      alert("Failed to create room code");
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .eq("code", code)
      .single();

    if (error || !data) {
      alert("Failed to load room after creation.");
      console.error("Room fetch error:", error);
      setIsLoading(false);
      return;
    }

    setBoard(data.board_state);
    setBoardSize(data.board_size);
    setRoomCode(code);
    setPlayerSymbol("X");
    setRoom(data);
    _setInternalRoom(data);
    setIsLoading(false);
    alert(`Room created. Share code: ${code}`);
  }, [boardSize, playerId, setBoard, setBoardSize, setRoom, setIsLoading]);

  const handleJoinRoom = useCallback(async () => {
    const code = prompt("Enter 6-character room code:");
    console.log("🚀 ~ handleJoinRoom ~ code:", code);
    if (!code) return;
    setIsLoading(true);

    try {
      const { data, error } = await supabase.rpc("join_room", {
        room_code: code,
        p_id: playerId,
      });
      console.log("🚀 ~ handleJoinRoom ~ data:", data);

      if (error || !data) {
        throw new Error(error?.message || "Failed to execute join_room RPC.");
      }

      const result = data[0];
      if (!result.success) {
        alert(result.message);
        setIsLoading(false);
        return;
      }

      const { data: updatedRoom, error: refetchError } = await supabase
        .from("rooms")
        .select("*")
        .eq("code", code)
        .single();

      if (refetchError || !updatedRoom) {
        throw new Error("Failed to sync room after joining.");
      }

      const mySymbol = result.joined_as as "X" | "O";
      setBoard(updatedRoom.board_state);
      setBoardSize(updatedRoom.board_size);
      setPlayerSymbol(mySymbol);
      setRoomCode(code);
      setRoom(updatedRoom);
      _setInternalRoom(updatedRoom);
    } catch (err) {
      console.log("🚀 ~ handleJoinRoom ~ err:", err);
      console.error("Join room error:", err);
      alert((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [playerId, setBoard, setBoardSize, setRoom, setIsLoading]);

  // const handleJoinRoom = useCallback(async () => {
  //   const code = prompt("Enter 6-character room code:");
  //   if (!code) return;
  //   setIsLoading(true);

  //   const { data: initialData, error: fetchError } = await supabase
  //     .from("rooms")
  //     .select("*")
  //     .eq("code", code)
  //     .single();

  //   if (fetchError || !initialData) {
  //     alert("Room not found.");
  //     console.error("Join error:", fetchError);
  //     setIsLoading(false);
  //     return;
  //   }

  //   // DEV
  //   console.log("playerId", playerId);
  //   console.log("Room:", initialData);
  //   if (
  //     initialData.player_x !== playerId &&
  //     initialData.player_o !== playerId &&
  //     initialData.player_x !== null &&
  //     initialData.player_o !== null
  //   ) {
  //     alert("Room is full and you are not one of the registered players.");
  //     setIsLoading(false);
  //     return;
  //   }

  //   const updateField =
  //     initialData.player_x === null || initialData.player_x === playerId
  //       ? "player_x"
  //       : initialData.player_o === null || initialData.player_o === playerId
  //       ? "player_o"
  //       : null;

  //   if (!updateField) {
  //     alert("Room is full");
  //     setIsLoading(false);
  //     return;
  //   }

  //   await supabase
  //     .from("rooms")
  //     .update({ [updateField]: playerId })
  //     .eq("code", code);

  //   const { data: updatedRoom, error: refetchError } = await supabase
  //     .from("rooms")
  //     .select("*")
  //     .eq("code", code)
  //     .single();

  //   if (refetchError || !updatedRoom) {
  //     alert("Failed to sync room after joining.");
  //     console.error("Refetch error:", refetchError);
  //     setIsLoading(false);
  //     return;
  //   }

  //   const mySymbol = updateField === "player_x" ? "X" : "O";
  //   setBoard(updatedRoom.board_state);
  //   setBoardSize(updatedRoom.board_size);
  //   setPlayerSymbol(mySymbol);
  //   setRoomCode(code);
  //   setRoom(updatedRoom);
  //   _setInternalRoom(updatedRoom);
  //   setIsLoading(false);
  // }, [playerId, setBoard, setBoardSize, setRoom, setIsLoading]);

  return {
    playerId,
    playerSymbol,
    room,
    roomCode,
    handleHostRoom,
    handleJoinRoom,
  };
}
