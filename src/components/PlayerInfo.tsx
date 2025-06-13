import {
  instructionsStyle,
  winnerStyle,
  nextPlayerStyle,
} from "../styles/styles";
import type { Room, Player, Winner } from "../types/game";

interface Props {
  playerId: string;
  room: Room | null;
  roomCode: string | null;
  playerSymbol: Player;
  isWinner: Winner;
  isGameOver: boolean;
}

export function PlayerInfo({
  playerId,
  room,
  roomCode,
  playerSymbol,
  isWinner,
  isGameOver,
}: Props) {
  const displaySymbol =
    room?.player_x === playerId
      ? "X"
      : room?.player_o === playerId
      ? "O"
      : "Spectator";

  const status =
    isGameOver || !room
      ? "Game over"
      : room.current_turn === playerSymbol
      ? "Your turn"
      : "Waiting for opponent";

  return (
    <>
      <div style={instructionsStyle}>
        You are: <strong>{playerId}</strong> ({displaySymbol})
      </div>
      <div style={instructionsStyle}>{status}</div>
      <div id="winnerArea" style={winnerStyle}>
        Winner: <span>{isWinner}</span>
      </div>
      <div style={instructionsStyle}>Room: {roomCode}</div>
      <div id="statusArea" style={nextPlayerStyle}>
        Next player: <span>{playerSymbol}</span>
      </div>
    </>
  );
}
