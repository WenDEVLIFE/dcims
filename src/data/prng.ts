/**
 * Deterministic pseudo-random source for seed data.
 *
 * A fixed seed means the demo dataset is identical on every load, on the server
 * and the client, so nothing shifts between renders or reloads. This is a
 * seeded generator, not cryptographic randomness.
 */

export interface Rng {
  next: () => number;
  int: (min: number, max: number) => number;
  float: (min: number, max: number, decimals?: number) => number;
  pick: <T>(items: readonly T[]) => T;
  pickMany: <T>(items: readonly T[], count: number) => T[];
  chance: (probability: number) => boolean;
}

/** mulberry32 — small, fast, and stable across engines. */
export function createRng(seed: number): Rng {
  let state = seed >>> 0;

  function next(): number {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function int(min: number, max: number): number {
    return Math.floor(next() * (max - min + 1)) + min;
  }

  function float(min: number, max: number, decimals = 2): number {
    const value = next() * (max - min) + min;
    const factor = 10 ** decimals;
    return Math.round(value * factor) / factor;
  }

  function pick<T>(items: readonly T[]): T {
    if (items.length === 0) throw new Error("Cannot pick from an empty list");
    return items[int(0, items.length - 1)];
  }

  function pickMany<T>(items: readonly T[], count: number): T[] {
    const pool = [...items];
    const picked: T[] = [];
    const target = Math.min(count, pool.length);
    for (let index = 0; index < target; index += 1) {
      const [value] = pool.splice(int(0, pool.length - 1), 1);
      picked.push(value);
    }
    return picked;
  }

  function chance(probability: number): boolean {
    return next() < probability;
  }

  return { next, int, float, pick, pickMany, chance };
}

/** Seed shared by every generator module so ordering never drifts. */
export const SEED = 20261125;
