import type { Board, Player, Winner } from "../types/game";

function isPlayable(cell: Player): cell is Exclude<Player, null | "--"> {
  return cell !== null && cell !== "--";
}

export function getWinner({
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
