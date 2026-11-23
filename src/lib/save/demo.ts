import {
  CHARACTER_COUNT,
  CHARACTER_DATA_STRIDE,
  CHARACTER_LABELS,
  CHARACTER_NAME_STRIDE,
  FIELD_SIZES,
  FILE_OFFSETS,
  SAVE_MAGIC,
  SAVE_SIZE_BYTES,
  SLOT_COUNT,
  SLOT_OFFSETS,
  SLOT_SIZE,
} from './constants'
import { encodeName, encodeShiftJis } from './encoding'
import { CT_EXP_TO_NEXT, CT_EXP_TOTAL } from './expTable'
import { parseSave, serializeSave } from './parser'

/** Generate a valid in-memory 64KB Chrono Trigger DS save so the editor can be explored. */
export function createDemoSaveBytes(): Uint8Array {
  const rawBytes = new Uint8Array(SAVE_SIZE_BYTES)
  rawBytes.fill(0xff)

  // Global header
  const view = new DataView(rawBytes.buffer)
  view.setUint32(FILE_OFFSETS.MAGIC, SAVE_MAGIC, true)
  const title = encodeShiftJis('フォーマット済みファイルデータ！', FIELD_SIZES.HEADER_TEXT)
  rawBytes.set(title, FILE_OFFSETS.HEADER_TEXT)
  view.setUint32(0x0024, FILE_OFFSETS.SLOT_TABLE, true)

  // Initialize slots
  for (let s = 0; s < SLOT_COUNT; s += 1) {
    const slotOffset = FILE_OFFSETS.SLOT_TABLE + s * SLOT_SIZE
    const sView = new DataView(rawBytes.buffer, slotOffset, SLOT_SIZE)

    // Clear slot to 0
    rawBytes.subarray(slotOffset, slotOffset + SLOT_SIZE).fill(0)

    // Money, saves, playtime
    sView.setUint32(SLOT_OFFSETS.MONEY, 125000 * (s + 1), true)
    sView.setUint32(SLOT_OFFSETS.SAVE_COUNT, 12 + s * 5, true)
    sView.setUint32(SLOT_OFFSETS.PLAYTIME, 3600 * (15 + s * 10) + 1800, true)
    sView.setUint32(SLOT_OFFSETS.PLAYTIME_SUMMARY, 3600 * (15 + s * 10) + 1800, true)
    sView.setUint8(SLOT_OFFSETS.SILVER_POINTS, 25)
    sView.setUint8(SLOT_OFFSETS.CAT_FOOD, 10)

    // Names
    for (let i = 0; i < CHARACTER_COUNT; i += 1) {
      const nameBytes = encodeName(CHARACTER_LABELS[i], FIELD_SIZES.CHARACTER_NAME)
      rawBytes.set(
        nameBytes,
        slotOffset + SLOT_OFFSETS.CHARACTER_NAMES + i * CHARACTER_NAME_STRIDE,
      )
    }
    rawBytes.set(encodeName('Epoch', FIELD_SIZES.AIRSHIP_NAME), slotOffset + SLOT_OFFSETS.AIRSHIP_NAME)
    rawBytes.set(encodeName('Crono', FIELD_SIZES.MAIN_CHARACTER_NAME), slotOffset + SLOT_OFFSETS.MAIN_CHARACTER_NAME)
    rawBytes.set(encodeName('Nadia', FIELD_SIZES.NADIA_NAME), slotOffset + SLOT_OFFSETS.NADIA_NAME)

    // Party: [0, 1, 2] -> Crono, Marle, Lucca
    sView.setUint8(SLOT_OFFSETS.PARTY, 0)
    sView.setUint8(SLOT_OFFSETS.PARTY + 1, 1)
    sView.setUint8(SLOT_OFFSETS.PARTY + 2, 2)

    // Character stats
    const baseLevels = [50, 48, 49, 47, 46, 45, 52]
    for (let i = 0; i < CHARACTER_COUNT; i += 1) {
      const charBase = slotOffset + SLOT_OFFSETS.CHARACTERS_DATA + i * CHARACTER_DATA_STRIDE
      const cView = new DataView(rawBytes.buffer, charBase, CHARACTER_DATA_STRIDE)
      const lv = baseLevels[i]
      cView.setUint32(0x00, i, true) // Character ID
      cView.setUint16(0x08, 750, true) // curHp
      cView.setUint16(0x0a, 750, true) // maxHp
      cView.setUint16(0x0c, 70, true) // curMp
      cView.setUint16(0x0e, 70, true) // maxMp
      cView.setUint16(0x10, 750, true) // baseHp
      cView.setUint8(0x12, 60 + i) // power
      cView.setUint8(0x13, 65) // stamina
      cView.setUint8(0x14, 12) // speed
      cView.setUint8(0x15, 50 + i * 2) // magic
      cView.setUint8(0x16, 30) // hit
      cView.setUint8(0x17, 30) // evade
      cView.setUint8(0x18, 60) // magicDefense
      cView.setUint8(0x19, lv) // level
      cView.setUint32(0x1c, CT_EXP_TOTAL[lv] ?? 250000, true) // exp
      cView.setUint16(0x3a, CT_EXP_TO_NEXT[lv] ?? 0, true) // exp to next level
      cView.setUint8(0x44, 60 + i) // current power
      cView.setUint8(0x45, 65) // current stamina
      cView.setUint8(0x46, 12) // current speed
      cView.setUint8(0x47, 50 + i * 2) // current magic
      cView.setUint8(0x48, 30) // current hit
      cView.setUint8(0x49, 30) // current evade
      cView.setUint8(0x4a, 60) // current magicDefense
    }

    // A few sample inventory items
    // Weapons: Steel Saber (id 3)
    sView.setUint16(SLOT_OFFSETS.WEAPONS, 3, true)
    sView.setUint16(SLOT_OFFSETS.WEAPONS + 2, 1, true)
    // Consumables: Potion (id 0x4001) x10, Shelter (id 0x400C) x5
    sView.setUint16(SLOT_OFFSETS.CONSUMABLES, 0x4001, true)
    sView.setUint16(SLOT_OFFSETS.CONSUMABLES + 2, 10, true)
    sView.setUint16(SLOT_OFFSETS.CONSUMABLES + 4, 0x400c, true)
    sView.setUint16(SLOT_OFFSETS.CONSUMABLES + 6, 5, true)
  }

  const parsed = parseSave(rawBytes)
  return serializeSave(parsed)
}
