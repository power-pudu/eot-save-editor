import { describe, expect, it } from 'vitest'
import {
  calculateNextExp,
  getExpToNext,
  getExpTotal,
  getLevelForExp,
  isExpInLevelRange,
} from './expTable'

describe('Chrono Trigger EXP tables and helper functions', () => {
  it('correctly provides known level total EXP milestones', () => {
    expect(getExpTotal(1)).toBe(0)
    expect(getExpTotal(2)).toBe(20)
    expect(getExpTotal(3)).toBe(60)
    expect(getExpTotal(37)).toBe(97780) // Magus base level
    expect(getExpTotal(49)).toBe(222320)
    expect(getExpTotal(82)).toBe(1002880)
    expect(getExpTotal(99)).toBe(1743570)
  })

  it('correctly provides EXP countdown to next level', () => {
    expect(getExpToNext(1)).toBe(20)
    expect(getExpToNext(37)).toBe(7940)
    expect(getExpToNext(49)).toBe(13520)
    expect(getExpToNext(82)).toBe(36290)
    expect(getExpToNext(99)).toBe(0) // 0 at max level
  })

  it('determines the exact level for any cumulative EXP amount', () => {
    expect(getLevelForExp(0)).toBe(1)
    expect(getLevelForExp(19)).toBe(1)
    expect(getLevelForExp(20)).toBe(2)
    expect(getLevelForExp(59)).toBe(2)
    expect(getLevelForExp(60)).toBe(3)
    expect(getLevelForExp(97780)).toBe(37)
    expect(getLevelForExp(222320)).toBe(49)
    expect(getLevelForExp(235839)).toBe(49)
    expect(getLevelForExp(235840)).toBe(50)
    expect(getLevelForExp(1743570)).toBe(99)
    expect(getLevelForExp(9999999)).toBe(99)
  })

  it('checks if an EXP value is within the level range', () => {
    // Level 49 range: [222320, 235839]
    expect(isExpInLevelRange(222320, 49)).toBe(true)
    expect(isExpInLevelRange(225000, 49)).toBe(true)
    expect(isExpInLevelRange(235839, 49)).toBe(true)

    // Outside Level 49 range
    expect(isExpInLevelRange(222319, 49)).toBe(false)
    expect(isExpInLevelRange(235840, 49)).toBe(false)
    expect(isExpInLevelRange(500000, 49)).toBe(false)
  })

  it('computes remaining countdown to next level accurately', () => {
    // Level 49 starts at 222320, level 50 starts at 235840 (diff 13520)
    expect(calculateNextExp(49, 222320)).toBe(13520)
    expect(calculateNextExp(49, 225000)).toBe(235840 - 225000)
    expect(calculateNextExp(99, 1743570)).toBe(0)
    expect(calculateNextExp(99, 9999999)).toBe(0)
  })
})
