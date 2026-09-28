export const SIZE = 8;

export type Cell = string | null;
export type Shape = [number, number][];
export type Piece = { shape: Shape; color: string };

const SHAPES: Shape[] = [
  [[0, 0]],
  [[0, 0], [0, 1]],
  [[0, 0], [1, 0]],
  [[0, 0], [0, 1], [0, 2]],
  [[0, 0], [1, 0], [2, 0]],
  [[0, 0], [0, 1], [0, 2], [0, 3]],
  [[0, 0], [1, 0], [2, 0], [3, 0]],
  [[0, 0], [0, 1], [1, 0], [1, 1]],
  [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]],
  [[0, 0], [1, 0], [2, 0], [2, 1]],
  [[0, 1], [1, 1], [2, 1], [2, 0]],
  [[0, 0], [0, 1], [1, 0]],
  [[0, 0], [0, 1], [1, 1]],
  [[0, 0], [1, 0], [1, 1]],
  [[0, 1], [1, 0], [1, 1]],
  [[0, 0], [0, 1], [0, 2], [1, 1]],
  [[0, 1], [0, 2], [1, 0], [1, 1]],
  [[0, 0], [0, 1], [1, 1], [1, 2]],
];

const COLORS = [
  "bg-cyan-500",
  "bg-sky-500",
  "bg-emerald-500",
  "bg-amber-400",
  "bg-rose-500",
  "bg-violet-500",
];

const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

export const randomPiece = (): Piece => ({ shape: pick(SHAPES), color: pick(COLORS) });

export const emptyGrid = (): Cell[] => Array(SIZE * SIZE).fill(null);

export function canPlace(grid: Cell[], shape: Shape, r: number, c: number) {
  return shape.every(
    ([dr, dc]) => r + dr < SIZE && c + dc < SIZE && !grid[(r + dr) * SIZE + c + dc],
  );
}

export function fitsAnywhere(grid: Cell[], shape: Shape) {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) if (canPlace(grid, shape, r, c)) return true;
  return false;
}

// Places the piece, then blasts every full row and column.
export function place(grid: Cell[], piece: Piece, r: number, c: number) {
  const next = grid.slice();
  for (const [dr, dc] of piece.shape) next[(r + dr) * SIZE + c + dc] = piece.color;

  const blasted = new Set<number>();
  let lines = 0;
  for (let i = 0; i < SIZE; i++) {
    const row = Array.from({ length: SIZE }, (_, j) => i * SIZE + j);
    const col = Array.from({ length: SIZE }, (_, j) => j * SIZE + i);
    for (const line of [row, col]) {
      if (line.every((k) => next[k])) {
        lines++;
        line.forEach((k) => blasted.add(k));
      }
    }
  }
  for (const k of blasted) next[k] = null;

  return { grid: next, blasted: [...blasted], points: piece.shape.length + lines * lines * 10 };
}
