import { useEffect } from "react";
import type { Room } from "../types/game";
import { supabase } from "../utils/supabase";

export function useRoomSubscription({
  roomCode,
  onUpdate,
}: {
  roomCode: string | null;
  onUpdate: (room: Partial<Room>) => void;
}) {
  useEffect(() => {
    if (!roomCode) return;

    const channel = supabase
      .channel(`room-${roomCode}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "rooms",
          filter: `code=eq.${roomCode}`,
        },
        (payload) => onUpdate(payload.new as Partial<Room>)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomCode, onUpdate]);
}
