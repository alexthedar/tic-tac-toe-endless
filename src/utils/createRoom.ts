import { createEmptyBoard } from "./createEmptyBoard";
import { supabase } from "./supabase";

export async function createRoom({
  boardSize,
  playerId,
}: {
  boardSize: number;
  playerId: string;
}): Promise<string | null> {
  const board = createEmptyBoard(boardSize);

  const { data, error } = await supabase
    .from("rooms")
    .insert([
      {
        board_state: board,
        board_size: boardSize,
        current_turn: "X",
        player_x: playerId,
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
