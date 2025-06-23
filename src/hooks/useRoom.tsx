import { useState, useCallback } from "react";
import { supabase } from "../utils/supabase";
import { createRoom } from "../utils/createRoom";
import { getOrCreatePlayerId } from "../utils/getOrCreatePlayerId";
import type { Room } from "../types/game";

interface UseRoomArgs {
  onRoomUpdate: (room: Room) => void;
  setIsLoading: (loading: boolean) => void;
}

export function useRoom({ onRoomUpdate, setIsLoading }: UseRoomArgs) {
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [playerSymbol, setPlayerSymbol] = useState<"X" | "O" | null>(null);
  const playerId = getOrCreatePlayerId();

  const handleHostRoom = useCallback(
    async (boardSize: number) => {
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

      setRoomCode(code);
      setPlayerSymbol("X");
      onRoomUpdate(data);
      setIsLoading(false);
      alert(`Room created. Share code: ${code}`);
    },
    [playerId, onRoomUpdate, setIsLoading]
  );

  const handleJoinRoom = useCallback(async () => {
    const code = prompt("Enter 6-character room code:");
    if (!code) return;
    setIsLoading(true);

    try {
      const { data, error } = await supabase.rpc("join_room", {
        room_code: code,
        p_id: playerId,
      });

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
      setPlayerSymbol(mySymbol);
      setRoomCode(code);
      onRoomUpdate(updatedRoom);
    } catch (err) {
      console.error("Join room error:", err);
      alert((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [playerId, onRoomUpdate, setIsLoading]);

  return {
    playerId,
    playerSymbol,
    roomCode,
    handleHostRoom,
    handleJoinRoom,
  };
}
