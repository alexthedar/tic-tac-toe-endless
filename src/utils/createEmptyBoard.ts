import type { Player } from "../types/game";

export function createEmptyBoard(size: number): Player[][] {
  return Array.from({ length: size }, () => Array(size).fill(null));
}
