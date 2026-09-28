"use client";

import { useState } from "react";
import { SIZE, canPlace, emptyGrid, fitsAnywhere, place, randomPiece } from "./logic";
import type { Piece } from "./logic";

type Entry = { name: string; score: number };

const NAME_KEY = "block-blast-name";
const newTray = () => [randomPiece(), randomPiece(), randomPiece()];

export default function BlockBlast() {
  const [grid, setGrid] = useState(emptyGrid);
  const [tray, setTray] = useState<(Piece | null)[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [hover, setHover] = useState<[number, number] | null>(null);
  const [blasted, setBlasted] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [draft, setDraft] = useState("");
  const [board, setBoard] = useState<Entry[]>([]);

  const started = tray.length > 0;
  const gameOver = started && tray.every((p) => !p || !fitsAnywhere(grid, p.shape));

  function openGame() {
    try {
      setDraft((d) => d || localStorage.getItem(NAME_KEY) || "");
    } catch {}
    fetch("/api/scores")
      .then((r) => r.json())
      .then(setBoard)
      .catch(() => {});
    setOpen(true);
  }

  function start() {
    setGrid(emptyGrid());
    setTray(newTray());
    setSelected(null);
    setScore(0);
  }

  function join(e: React.FormEvent) {
    e.preventDefault();
    const n = draft.trim();
    if (!n) return;
    try {
      localStorage.setItem(NAME_KEY, n);
    } catch {}
    setName(n);
    start();
  }

  function submit(finalScore: number) {
    fetch("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, score: finalScore }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setBoard)
      .catch(() => {});
  }

  function drop(r: number, c: number) {
    const piece = selected !== null ? tray[selected] : null;
    if (!piece || !canPlace(grid, piece.shape, r, c)) return;

    const res = place(grid, piece, r, c);
    const left = tray.map((p, i) => (i === selected ? null : p));
    const nextTray = left.every((p) => !p) ? newTray() : left;
    const nextScore = score + res.points;

    setGrid(res.grid);
    setTray(nextTray);
    setSelected(null);
    setScore(nextScore);
    setBlasted(res.blasted);
    setTimeout(() => setBlasted([]), 400);
    if (nextTray.every((p) => !p || !fitsAnywhere(res.grid, p.shape))) submit(nextScore);
  }

  const active = selected !== null ? tray[selected] : null;
  const preview = new Set<number>();
  if (active && hover && canPlace(grid, active.shape, ...hover)) {
    for (const [dr, dc] of active.shape) preview.add((hover[0] + dr) * SIZE + hover[1] + dc);
  }

  const leaderboard = (
    <ol className="w-full space-y-1 text-left text-sm">
      {board.length === 0 && <li className="text-center text-slate-400">ยังไม่มีคะแนน</li>}
      {board.map((e, i) => (
        <li key={e.name} className="flex gap-2">
          <span className="w-5 text-right text-slate-400">{i + 1}.</span>
          <span className={`flex-1 truncate ${e.name === name ? "font-bold text-cyan-500" : ""}`}>
            {e.name}
          </span>
          <span className="font-bold">{e.score}</span>
        </li>
      ))}
    </ol>
  );

  if (!open) {
    return (
      <button
        onClick={openGame}
        aria-label="เล่นเกม Block Blast"
        title="เล่นเกม Block Blast"
        className="fixed right-3 top-3 rounded-md p-1.5 text-slate-300 transition hover:bg-slate-100 hover:text-slate-500 dark:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-400"
      >
        <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <rect x="1" y="1" width="6" height="6" rx="1" />
          <rect x="9" y="1" width="6" height="6" rx="1" />
          <rect x="1" y="9" width="6" height="6" rx="1" />
        </svg>
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => e.target === e.currentTarget && setOpen(false)}
    >
      <section className="relative w-full max-w-sm select-none rounded-2xl bg-white p-4 pt-10 text-slate-700 shadow-2xl dark:bg-neutral-900 dark:text-slate-200">
        <button
          onClick={() => setOpen(false)}
          aria-label="ปิดเกม"
          className="absolute right-3 top-2 text-2xl leading-none text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        >
          ×
        </button>

        {!name ? (
          <form onSubmit={join} className="flex flex-col gap-4">
            <h2 className="text-xl font-bold">Block Blast</h2>
            <label className="flex flex-col gap-1 text-left text-sm">
              ชื่อผู้เล่น
              <input
                autoFocus
                required
                maxLength={30}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-base outline-none focus:border-cyan-500 dark:border-neutral-700 dark:bg-neutral-800"
              />
            </label>
            <button className="rounded-full bg-cyan-500 py-2 font-bold text-white hover:bg-cyan-600">
              เริ่มเล่น
            </button>
            <h3 className="mt-2 text-sm font-bold">อันดับคะแนน</h3>
            {leaderboard}
          </form>
        ) : (
          <>
            <div className="mb-3 flex justify-between text-sm font-bold text-slate-600 dark:text-slate-300">
              <span className="truncate">{name}</span>
              <span>คะแนน {score}</span>
            </div>

            <div
              className="relative grid grid-cols-8 gap-1 rounded-xl bg-slate-800 p-2"
              onMouseLeave={() => setHover(null)}
            >
              {grid.map((cell, i) => {
                const r = Math.floor(i / SIZE);
                const c = i % SIZE;
                return (
                  <button
                    key={i}
                    aria-label={`แถว ${r + 1} คอลัมน์ ${c + 1}`}
                    onClick={() => drop(r, c)}
                    onMouseEnter={() => setHover([r, c])}
                    className={`aspect-square rounded-md transition ${
                      blasted.includes(i)
                        ? "animate-ping bg-white"
                        : cell ?? (preview.has(i) ? `${active!.color} opacity-50` : "bg-slate-700")
                    }`}
                  />
                );
              })}

              {gameOver && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 overflow-y-auto rounded-xl bg-slate-900/90 p-4 text-white">
                  <p className="text-2xl font-bold">จบเกม!</p>
                  <p>คะแนน {score}</p>
                  {leaderboard}
                  <div className="flex gap-2">
                    <button
                      onClick={start}
                      className="rounded-full bg-cyan-500 px-5 py-2 font-bold hover:bg-cyan-600"
                    >
                      เล่นอีกครั้ง
                    </button>
                    <button
                      onClick={() => {
                        setName("");
                        setTray([]);
                      }}
                      className="rounded-full px-4 py-2 text-sm text-slate-300 hover:bg-white/10"
                    >
                      เปลี่ยนชื่อ
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {tray.map((piece, i) => {
                if (!piece) return <div key={i} className="h-24" />;
                const rows = Math.max(...piece.shape.map(([r]) => r)) + 1;
                const cols = Math.max(...piece.shape.map(([, c]) => c)) + 1;
                const fits = fitsAnywhere(grid, piece.shape);
                return (
                  <button
                    key={i}
                    disabled={!fits}
                    onClick={() => setSelected(i === selected ? null : i)}
                    className={`flex h-24 items-center justify-center rounded-xl border-2 transition disabled:opacity-30 ${
                      i === selected
                        ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-500/10"
                        : "border-transparent hover:bg-slate-100 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <div
                      className="grid gap-0.5"
                      style={{
                        gridTemplateRows: `repeat(${rows}, 0.9rem)`,
                        gridTemplateColumns: `repeat(${cols}, 0.9rem)`,
                      }}
                    >
                      {piece.shape.map(([r, c]) => (
                        <span
                          key={`${r}-${c}`}
                          className={`rounded-sm ${piece.color}`}
                          style={{ gridRow: r + 1, gridColumn: c + 1 }}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            <p className="mt-3 text-xs text-slate-400">
              เลือกบล็อกด้านล่าง แล้วแตะช่องบนกระดาน (มุมซ้ายบนของบล็อก) · เต็มแถวหรือคอลัมน์ = ระเบิด!
            </p>
          </>
        )}
      </section>
    </div>
  );
}
