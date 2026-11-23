/**
 * Chrono Trigger DS (USA) level-up EXP tables.
 *
 * Sourced directly from arm9.bin at 0x0205540C (func_0202bee0).
 *
 * Mechanics:
 * - Each character's 0x60-byte record has:
 *   - +0x19 (u8): Current level (1 - 99).
 *   - +0x1C (u32 LE): Total accumulated EXP (capped at 9,999,999).
 *   - +0x3A (u16 LE): Countdown of EXP remaining until the next level-up.
 *
 * In battle:
 * - Gained EXP is subtracted from the counter at +0x3A.
 * - When the counter reaches 0 or below, level (+0x19) increments by 1,
 *   and the counter is reloaded with CT_EXP_TO_NEXT[newLevel].
 * - At level 99, the counter is set to 0.
 */

/** EXP required to advance from level L to level L+1. Index 0 is unused; index 99 is 0. */
export const CT_EXP_TO_NEXT: readonly number[] = [
  0, 20, 40, 70, 110, 160, 220, 300, 400, 520,
  650, 790, 940, 1100, 1270, 1450, 1640, 1840, 2050, 2270,
  2500, 2740, 2990, 3250, 3520, 3800, 4090, 4390, 4700, 5020,
  5350, 5690, 6040, 6400, 6770, 7150, 7540, 7940, 8350, 8770,
  9200, 9640, 10090, 10550, 11020, 11500, 11990, 12490, 13000, 13520,
  14050, 14590, 15140, 15700, 16270, 16850, 17440, 18040, 18650, 19270,
  19900, 20540, 21190, 21850, 22520, 23200, 23890, 24590, 25300, 26020,
  26750, 27490, 28240, 29000, 29770, 30550, 31340, 32140, 32950, 33770,
  34600, 35440, 36290, 37150, 38020, 38900, 39790, 40690, 41600, 42520,
  43450, 44390, 45340, 46300, 47270, 48250, 49240, 50240, 51250, 0,
]

/** Cumulative total EXP required when level L is first reached. Index 0 is unused; index 99 is 1,743,570. */
export const CT_EXP_TOTAL: readonly number[] = [
  0, 0, 20, 60, 130, 240, 400, 620, 920, 1320,
  1840, 2490, 3280, 4220, 5320, 6590, 8040, 9680, 11520, 13570,
  15840, 18340, 21080, 24070, 27320, 30840, 34640, 38730, 43120, 47820,
  52840, 58190, 63880, 69920, 76320, 83090, 90240, 97780, 105720, 114070,
  122840, 132040, 141680, 151770, 162320, 173340, 184840, 196830, 209320, 222320,
  235840, 249890, 264480, 279620, 295320, 311590, 328440, 345880, 363920, 382570,
  401840, 421740, 442280, 463470, 485320, 507840, 531040, 554930, 579520, 604820,
  630840, 657590, 685080, 713320, 742320, 772090, 802640, 833980, 866120, 899070,
  932840, 967440, 1002880, 1039170, 1076320, 1114340, 1153240, 1193030, 1233720, 1275320,
  1317840, 1361290, 1405680, 1451020, 1497320, 1544590, 1592840, 1642080, 1692320, 1743570,
]

/** Get the EXP countdown to the next level for a given level (1 - 99). */
export function getExpToNext(level: number): number {
  if (level >= 99) return 0
  if (level <= 1) return CT_EXP_TO_NEXT[1]
  return CT_EXP_TO_NEXT[level] ?? 0
}

/** Get the minimum cumulative EXP required to reach a given level (1 - 99). */
export function getExpTotal(level: number): number {
  if (level >= 99) return CT_EXP_TOTAL[99]
  if (level <= 1) return 0
  return CT_EXP_TOTAL[level] ?? 0
}

/**
 * Returns the valid experience point range [min, max] for a specific level.
 * E.g., Level 1 is [0, 19], Level 2 is [20, 59], Level 99 is [1743570, 9999999].
 */
export function getExpRangeForLevel(level: number): { min: number; max: number } {
  const lvl = Math.max(1, Math.min(99, level))
  const min = CT_EXP_TOTAL[lvl] ?? 0
  if (lvl >= 99) {
    return { min, max: 9_999_999 }
  }
  const max = (CT_EXP_TOTAL[lvl + 1] ?? (min + 1)) - 1
  return { min, max }
}

/**
 * Checks whether an experience point value falls within the natural range of a level.
 */
export function isExpInLevelRange(exp: number, level: number): boolean {
  const { min, max } = getExpRangeForLevel(level)
  return exp >= min && exp <= max
}

/**
 * Calculates which level corresponds to a given cumulative EXP amount.
 */
export function getLevelForExp(exp: number): number {
  const clamped = Math.max(0, Math.min(9_999_999, exp))
  for (let lvl = 99; lvl >= 1; lvl -= 1) {
    if (clamped >= (CT_EXP_TOTAL[lvl] ?? 0)) {
      return lvl
    }
  }
  return 1
}

/**
 * Calculates remaining EXP until next level (+0x3A in save record).
 * If level is 99, returns 0.
 */
export function calculateNextExp(level: number, exp: number): number {
  if (level >= 99) return 0
  const nextLevelTotal = CT_EXP_TOTAL[level + 1] ?? 0
  const remaining = nextLevelTotal - exp
  if (remaining <= 0) return 0
  return Math.min(65535, remaining)
}
