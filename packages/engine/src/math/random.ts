/**
 * Random number utilities.
 *
 * Mirrors the GMS random API:
 *   random, irandom, random_range, irandom_range,
 *   randomize, random_set_seed, random_get_seed
 *
 * Uses a seeded Mulberry32 PRNG for reproducible sequences.
 * Call randomize() or random_set_seed() to initialise the seed.
 * By default, seed is 0 (deterministic).
 */

// =========================================================================
// Mulberry32 PRNG (fast, good quality for games)
// =========================================================================

let _seed: number = 0

function _mulberry32(): number {
    _seed |= 0
    _seed = _seed + 0x6D2B79F5 | 0
    let t  = Math.imul(_seed ^ (_seed >>> 15), 1 | _seed)
    t      = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

// =========================================================================
// Public GMS-style API
// =========================================================================

/**
 * Sets the RNG seed to a specific value.
 * @param seed - Integer seed value
 */
export function random_set_seed(seed: number): void {
    _seed = seed >>> 0  // Force unsigned 32-bit
}

/**
 * Returns the current RNG seed.
 */
export function random_get_seed(): number {
    return _seed >>> 0
}

/**
 * Randomises the seed using the current timestamp.
 */
export function randomize(): void {
    _seed = (Date.now() ^ (Math.random() * 0xFFFFFFFF)) >>> 0
}

/**
 * Returns a random float in [0, n).
 * @param n - Upper bound (exclusive)
 */
export function random(n: number): number {
    return _mulberry32() * n
}

/**
 * Returns a random integer in [0, n] (inclusive).
 * @param n - Maximum value (inclusive)
 */
export function irandom(n: number): number {
    return Math.floor(_mulberry32() * (n + 1))
}

/**
 * Returns a random float in [lo, hi).
 * @param lo - Lower bound (inclusive)
 * @param hi - Upper bound (exclusive)
 */
export function random_range(lo: number, hi: number): number {
    return lo + _mulberry32() * (hi - lo)
}

/**
 * Returns a random integer in [lo, hi] (both inclusive).
 * @param lo - Lower bound (inclusive)
 * @param hi - Upper bound (inclusive)
 */
export function irandom_range(lo: number, hi: number): number {
    return Math.floor(lo + _mulberry32() * (hi - lo + 1))
}

/**
 * Randomly shuffles an array in-place (Fisher-Yates).
 * @param arr - Array to shuffle
 * @returns The same array (mutated)
 */
export function array_shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(_mulberry32() * (i + 1))
        const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp
    }
    return arr
}

/**
 * Returns a random element from an array.
 * Returns undefined for empty arrays.
 * @param arr - Source array
 */
export function array_random<T>(arr: T[]): T | undefined {
    if (arr.length === 0) return undefined
    return arr[Math.floor(_mulberry32() * arr.length)]
}

/**
 * Returns a random float using JavaScript's built-in Math.random().
 * Not affected by random_set_seed() — use for non-reproducible randomness.
 */
export function random_native(): number {
    return Math.random()
}
