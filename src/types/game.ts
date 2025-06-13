export type Player = "X" | "O" | null | "--";
export type Winner = Exclude<Player, null | "--"> | "Draw" | "None";
export type Board = Player[][];
export type Room = {
  code: string;
  board_state: Board;
  board_size: number;
  current_turn: Player | null;
  is_game_over: boolean;
  winner: Winner | null;
  player_x: string | null;
  player_o: string | null;
};
