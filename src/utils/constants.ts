import type { Board } from "../types/game";

export const startingBoardSize = 3;
export const startingBoard: Board = Array(startingBoardSize)
  .fill(null)
  .map(() => Array(startingBoardSize).fill(null));
export const startingPlayer = "X";
export const startingWinner = "None";
export const maxBoardSize = 10;
export const minBoardSize = 3;
export const startingStats = {
  X: 0,
  O: 0,
  Draw: 0,
};
export const startingGameOverFlag = false;
export const defaultIsLoadingState = false;
