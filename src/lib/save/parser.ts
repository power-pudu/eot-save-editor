import { calculateSlotChecksum, sum32 } from './checksum'
import {
  CHARACTER_COUNT,
  CHARACTER_DATA_STRIDE,
  CHARACTER_LABELS,
  CHARACTER_NAME_STRIDE,
  FIELD_LIMITS,
  FIELD_SIZES,
  FILE_OFFSETS,
  SAVE_MAGIC,
  SAVE_SIZE_BYTES,
  SLOT_COUNT,
  SLOT_OFFSETS,
  SLOT_SIZE,
} from './constants'
import { decodeName, decodeShiftJis, encodeName } from './encoding'
import { getExpToNext } from './expTable'
import { ITEM_CATEGORIES } from './itemNames'
import type {
  CharacterStats,
  InventoryItem,
  SaveData,
  SaveDocument,
  SlotData,
} from './types'

export class SaveParseError extends Error {
  override name = 'SaveParseError'
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, Math.trunc(value)))
}

export function assertSaveSize(bytes: Uint8Array): void {
  if (bytes.length !== SAVE_SIZE_BYTES) {
    throw new SaveParseError(
      `Expected a ${SAVE_SIZE_BYTES / 1024} KB save, received ${bytes.length} bytes ` +
        `(${(bytes.length / 1024).toFixed(1)} KB).`,
    )
  }
}

function createDefaultCharacter(id: number): CharacterStats {
  return {
    id,
    name: CHARACTER_LABELS[id] ?? 'Hero',
    curHp: 70,
    maxHp: 70,
    curMp: 6,
    maxMp: 6,
    baseHp: 70,
    power: 5,
    stamina: 8,
    speed: 8,
    magic: 5,
    hit: 8,
    evade: 6,
    magicDefense: 2,
    exp: 0,
    nextExp: 32,
    level: 1,
  }
}

function parseCharacter(
  view: DataView,
  charBase: number,
  index: number,
  name: string,
): CharacterStats {
  return {
    id: index,
    name,
    curHp: view.getUint16(charBase + 0x08, true),
    maxHp: view.getUint16(charBase + 0x0a, true),
    curMp: view.getUint16(charBase + 0x0c, true),
    maxMp: view.getUint16(charBase + 0x0e, true),
    baseHp: view.getUint16(charBase + 0x10, true),
    power: view.getUint8(charBase + 0x12),
    stamina: view.getUint8(charBase + 0x13),
    speed: view.getUint8(charBase + 0x14),
    magic: view.getUint8(charBase + 0x15),
    hit: view.getUint8(charBase + 0x16),
    evade: view.getUint8(charBase + 0x17),
    magicDefense: view.getUint8(charBase + 0x18),
    level: view.getUint8(charBase + 0x19),
    exp: view.getUint32(charBase + 0x1c, true),
    nextExp: view.getUint16(charBase + 0x3a, true),
  }
}

function parseSlot(rawBytes: Uint8Array, slotIndex: number): SlotData {
  const slotOffset = FILE_OFFSETS.SLOT_TABLE + slotIndex * SLOT_SIZE
  const view = new DataView(rawBytes.buffer, rawBytes.byteOffset + slotOffset, SLOT_SIZE)

  const storedChecksum = view.getUint32(SLOT_OFFSETS.CHECKSUM, true)
  const slotBytes = rawBytes.subarray(slotOffset, slotOffset + SLOT_SIZE)
  const calculatedChecksum = calculateSlotChecksum(slotBytes)
  const isValidChecksum = storedChecksum === calculatedChecksum

  const money = view.getUint32(SLOT_OFFSETS.MONEY, true)
  const saveCount = view.getUint32(SLOT_OFFSETS.SAVE_COUNT, true)
  const playtimeSeconds = view.getUint32(SLOT_OFFSETS.PLAYTIME, true)
  const silverPoints = view.getUint8(SLOT_OFFSETS.SILVER_POINTS)
  const catFood = view.getUint8(SLOT_OFFSETS.CAT_FOOD)
  const rawLeader = view.getUint8(SLOT_OFFSETS.PARTY)

  // In Chrono Trigger DS, an uninitialized slot contains:
  // 1) storedChecksum equal to SAVE_MAGIC (0xFEDCBA98) instead of an additive checksum
  // 2) Or rawLeader === 0xFF, money === 0xFFFFFFFF, playtimeSeconds === 0xFFFFFFFF
  // 3) Or completely zeroed out (wiped memory)
  const isUninitializedMagic = storedChecksum === SAVE_MAGIC
  const isAllUnset =
    rawLeader === 0xff &&
    (money === 0xffffffff || money === 0) &&
    (playtimeSeconds === 0xffffffff || playtimeSeconds === 0)
  const isZeroed = storedChecksum === 0 && slotBytes.every((b) => b === 0)
  const isInitialized = !isUninitializedMagic && !isAllUnset && !isZeroed

  // Clean values for uninitialized slots
  const cleanMoney = isInitialized ? money : 0
  const cleanSaveCount = isInitialized ? saveCount : 0
  const cleanPlaytimeSeconds = isInitialized ? playtimeSeconds : 0
  const cleanSilverPoints = isInitialized ? silverPoints : 0
  const cleanCatFood = isInitialized ? catFood : 0
  const cleanParty: [number, number, number] = isInitialized
    ? [view.getUint8(SLOT_OFFSETS.PARTY), view.getUint8(SLOT_OFFSETS.PARTY + 1), view.getUint8(SLOT_OFFSETS.PARTY + 2)]
    : [0, 255, 255]

  // Names
  const characterNames: string[] = []
  for (let i = 0; i < CHARACTER_COUNT; i += 1) {
    const nameOffset = slotOffset + SLOT_OFFSETS.CHARACTER_NAMES + i * CHARACTER_NAME_STRIDE
    const decoded = isInitialized ? decodeName(rawBytes, nameOffset, FIELD_SIZES.CHARACTER_NAME) : ''
    characterNames.push(decoded || CHARACTER_LABELS[i])
  }

  const airshipName = isInitialized
    ? decodeName(rawBytes, slotOffset + SLOT_OFFSETS.AIRSHIP_NAME, FIELD_SIZES.AIRSHIP_NAME) || 'Epoch'
    : 'Epoch'
  const leadName = isInitialized
    ? decodeName(
        rawBytes,
        slotOffset + SLOT_OFFSETS.MAIN_CHARACTER_NAME,
        FIELD_SIZES.MAIN_CHARACTER_NAME,
      ) || characterNames[0] || 'Crono'
    : 'Crono'
  const nadiaName = isInitialized
    ? decodeName(rawBytes, slotOffset + SLOT_OFFSETS.NADIA_NAME, FIELD_SIZES.NADIA_NAME) || 'Nadia'
    : 'Nadia'

  // Characters
  const characters: CharacterStats[] = []
  for (let i = 0; i < CHARACTER_COUNT; i += 1) {
    if (isInitialized) {
      const charBase = SLOT_OFFSETS.CHARACTERS_DATA + i * CHARACTER_DATA_STRIDE
      characters.push(parseCharacter(view, charBase, i, characterNames[i]))
    } else {
      characters.push(createDefaultCharacter(i))
    }
  }

  // Inventory
  const inventory: SlotData['inventory'] = {
    weapon: [],
    armor: [],
    helmet: [],
    accessory: [],
    consumable: [],
    important: [],
  }

  if (isInitialized) {
    for (const cat of ITEM_CATEGORIES) {
      const items: InventoryItem[] = []
      for (let slot = 0; slot < cat.slotCount; slot += 1) {
        const itemOffset = cat.offset + slot * FIELD_SIZES.ITEM_SLOT
        const itemId = view.getUint16(itemOffset, true)
        const quantity = view.getUint16(itemOffset + 2, true)
        items.push({ slotIndex: slot, itemId, quantity })
      }
      inventory[cat.id] = items
    }
  }

  return {
    index: slotIndex,
    storedChecksum,
    calculatedChecksum,
    isValidChecksum,
    isInitialized,
    money: cleanMoney,
    saveCount: cleanSaveCount,
    playtimeSeconds: cleanPlaytimeSeconds,
    silverPoints: cleanSilverPoints,
    catFood: cleanCatFood,
    characterNames,
    airshipName,
    leadName,
    nadiaName,
    party: cleanParty,
    characters,
    inventory,
  }
}

/** Parse raw save bytes into editable state. */
export function parseSave(rawBytes: Uint8Array): SaveDocument {
  assertSaveSize(rawBytes)

  const view = new DataView(rawBytes.buffer, rawBytes.byteOffset, rawBytes.byteLength)
  const magic = view.getUint32(FILE_OFFSETS.MAGIC, true)
  const headerTitle = decodeShiftJis(rawBytes, FILE_OFFSETS.HEADER_TEXT, FIELD_SIZES.HEADER_TEXT)

  const slots: SlotData[] = []
  for (let i = 0; i < SLOT_COUNT; i += 1) {
    slots.push(parseSlot(rawBytes, i))
  }

  const primarySlot = slots[0]
  const defaultSlotIndex = Math.max(
    0,
    slots.findIndex((s) => s.isInitialized),
  )

  return {
    rawBytes,
    magic,
    storedChecksum: primarySlot?.storedChecksum ?? 0,
    checksumAlgorithm: 'sum32',
    data: {
      headerTitle,
      activeSlotIndex: defaultSlotIndex,
      slots,
    },
  }
}

function writeCharacter(
  view: DataView,
  charBase: number,
  char: CharacterStats,
): void {
  view.setUint32(charBase + 0x00, char.id, true)
  view.setUint16(charBase + 0x08, clamp(char.curHp, FIELD_LIMITS.hp.min, FIELD_LIMITS.hp.storageMax), true)
  view.setUint16(charBase + 0x0a, clamp(char.maxHp, FIELD_LIMITS.hp.min, FIELD_LIMITS.hp.storageMax), true)
  view.setUint16(charBase + 0x0c, clamp(char.curMp, FIELD_LIMITS.mp.min, FIELD_LIMITS.mp.storageMax), true)
  view.setUint16(charBase + 0x0e, clamp(char.maxMp, FIELD_LIMITS.mp.min, FIELD_LIMITS.mp.storageMax), true)
  view.setUint16(charBase + 0x10, clamp(char.baseHp || char.maxHp, FIELD_LIMITS.hp.min, FIELD_LIMITS.hp.storageMax), true)

  view.setUint8(charBase + 0x12, clamp(char.power, FIELD_LIMITS.stat.min, FIELD_LIMITS.stat.storageMax))
  view.setUint8(charBase + 0x13, clamp(char.stamina, FIELD_LIMITS.stat.min, FIELD_LIMITS.stat.storageMax))
  view.setUint8(charBase + 0x14, clamp(char.speed, FIELD_LIMITS.speed.min, FIELD_LIMITS.speed.storageMax))
  view.setUint8(charBase + 0x15, clamp(char.magic, FIELD_LIMITS.stat.min, FIELD_LIMITS.stat.storageMax))
  view.setUint8(charBase + 0x16, clamp(char.hit, FIELD_LIMITS.stat.min, FIELD_LIMITS.stat.storageMax))
  view.setUint8(charBase + 0x17, clamp(char.evade, FIELD_LIMITS.stat.min, FIELD_LIMITS.stat.storageMax))
  view.setUint8(charBase + 0x18, clamp(char.magicDefense, FIELD_LIMITS.stat.min, FIELD_LIMITS.stat.storageMax))

  // Level is at record + 0x19 (e.g. 0x61D for Frog)
  view.setUint8(charBase + 0x19, clamp(char.level, FIELD_LIMITS.level.min, FIELD_LIMITS.level.storageMax))

  // Experience is at record + 0x1C (4 bytes LE)
  view.setUint32(charBase + 0x1c, clamp(char.exp, FIELD_LIMITS.exp.min, FIELD_LIMITS.exp.storageMax), true)

  // EXP to next level countdown is at record + 0x3A (uint16 LE)
  const nextExpVal = char.level >= 99 ? 0 : (char.nextExp ?? getExpToNext(char.level))
  view.setUint16(charBase + 0x3a, clamp(nextExpVal, 0, 65535), true)

  // Current / effective stats shown in game menu (+0x44 .. +0x4A)
  const curPwrEff = view.getUint8(charBase + 0x44)
  const curStaEff = view.getUint8(charBase + 0x45)
  const curSpdEff = view.getUint8(charBase + 0x46)
  const curMagEff = view.getUint8(charBase + 0x47)
  const curHitEff = view.getUint8(charBase + 0x48)
  const curEvaEff = view.getUint8(charBase + 0x49)
  const curMdfEff = view.getUint8(charBase + 0x4a)

  // Keep effective stats bounded and at least matching edited base stats
  view.setUint8(charBase + 0x44, Math.max(curPwrEff, char.power))
  view.setUint8(charBase + 0x45, Math.max(curStaEff, char.stamina))
  view.setUint8(charBase + 0x46, Math.max(curSpdEff, char.speed))
  view.setUint8(charBase + 0x47, Math.max(curMagEff, char.magic))
  view.setUint8(charBase + 0x48, Math.max(curHitEff, char.hit))
  view.setUint8(charBase + 0x49, Math.max(curEvaEff, char.evade))
  view.setUint8(charBase + 0x4a, Math.max(curMdfEff, char.magicDefense))
}

function writeFixedName(output: Uint8Array, offset: number, name: string): void {
  const encoded = encodeName(name, FIELD_SIZES.CHARACTER_NAME)
  for (let i = 0; i < FIELD_SIZES.CHARACTER_NAME; i += 1) {
    output[offset + i] = i < encoded.length ? encoded[i] : 0
  }
}

function writeSlot(output: Uint8Array, slot: SlotData): void {
  const slotOffset = FILE_OFFSETS.SLOT_TABLE + slot.index * SLOT_SIZE
  const view = new DataView(output.buffer, output.byteOffset + slotOffset, SLOT_SIZE)

  // Progress
  view.setUint32(
    SLOT_OFFSETS.MONEY,
    clamp(slot.money, FIELD_LIMITS.money.min, FIELD_LIMITS.money.storageMax),
    true,
  )
  view.setUint32(
    SLOT_OFFSETS.SAVE_COUNT,
    clamp(slot.saveCount, FIELD_LIMITS.saveCount.min, FIELD_LIMITS.saveCount.storageMax),
    true,
  )
  view.setUint32(
    SLOT_OFFSETS.PLAYTIME,
    clamp(slot.playtimeSeconds, FIELD_LIMITS.playtimeSeconds.min, FIELD_LIMITS.playtimeSeconds.storageMax),
    true,
  )
  // Summary copy of playtime at 0x21E8
  view.setUint32(
    SLOT_OFFSETS.PLAYTIME_SUMMARY,
    clamp(slot.playtimeSeconds, FIELD_LIMITS.playtimeSeconds.min, FIELD_LIMITS.playtimeSeconds.storageMax),
    true,
  )
  view.setUint8(
    SLOT_OFFSETS.SILVER_POINTS,
    clamp(slot.silverPoints, FIELD_LIMITS.silverPoints.min, FIELD_LIMITS.silverPoints.storageMax),
  )
  view.setUint8(
    SLOT_OFFSETS.CAT_FOOD,
    clamp(slot.catFood, FIELD_LIMITS.catFood.min, FIELD_LIMITS.catFood.storageMax),
  )

  // Names
  for (let i = 0; i < CHARACTER_COUNT; i += 1) {
    const charName = (slot.characterNames[i] && slot.characterNames[i].trim()) || CHARACTER_LABELS[i]
    writeFixedName(output, slotOffset + SLOT_OFFSETS.CHARACTER_NAMES + i * CHARACTER_NAME_STRIDE, charName)
  }
  writeFixedName(output, slotOffset + SLOT_OFFSETS.AIRSHIP_NAME, (slot.airshipName && slot.airshipName.trim()) || 'Epoch')

  // Lead name matches party leader
  const leaderId = slot.party[0] >= 0 && slot.party[0] < CHARACTER_COUNT ? slot.party[0] : 0
  const leaderName =
    (slot.characterNames[leaderId] && slot.characterNames[leaderId].trim()) ||
    (slot.leadName && slot.leadName.trim()) ||
    'Crono'
  writeFixedName(output, slotOffset + SLOT_OFFSETS.MAIN_CHARACTER_NAME, leaderName)

  writeFixedName(output, slotOffset + SLOT_OFFSETS.NADIA_NAME, (slot.nadiaName && slot.nadiaName.trim()) || 'Nadia')

  // Party
  view.setUint8(SLOT_OFFSETS.PARTY, slot.party[0])
  view.setUint8(SLOT_OFFSETS.PARTY + 1, slot.party[1])
  view.setUint8(SLOT_OFFSETS.PARTY + 2, slot.party[2])

  // Characters
  for (let i = 0; i < CHARACTER_COUNT; i += 1) {
    const char = slot.characters[i]
    if (!char) continue
    const charBase = SLOT_OFFSETS.CHARACTERS_DATA + i * CHARACTER_DATA_STRIDE
    writeCharacter(view, charBase, char)
  }

  // Inventory
  for (const cat of ITEM_CATEGORIES) {
    const items = slot.inventory[cat.id] ?? []
    for (const item of items) {
      if (item.slotIndex < 0 || item.slotIndex >= cat.slotCount) continue
      const itemOffset = cat.offset + item.slotIndex * FIELD_SIZES.ITEM_SLOT
      view.setUint16(itemOffset, item.itemId, true)
      view.setUint16(
        itemOffset + 2,
        clamp(item.quantity, FIELD_LIMITS.itemQuantity.min, FIELD_LIMITS.itemQuantity.storageMax),
        true,
      )
    }
  }

  // Recalculate 32-bit slot checksum
  const newChecksum = calculateSlotChecksum(output.subarray(slotOffset, slotOffset + SLOT_SIZE))
  view.setUint32(SLOT_OFFSETS.CHECKSUM, newChecksum, true)
}

/** Serialize edited state back into a full save buffer. */
export function serializeSave(document: SaveDocument): Uint8Array {
  assertSaveSize(document.rawBytes)

  const output = new Uint8Array(document.rawBytes.length)
  output.set(document.rawBytes)

  for (const slot of document.data.slots) {
    if (!slot.isInitialized) continue
    writeSlot(output, slot)
  }

  return output
}

/** Checksum of the active slot that would be exported right now. */
export function calculateCurrentChecksum(document: SaveDocument): number {
  const activeSlot = document.data.slots[document.data.activeSlotIndex]
  if (!activeSlot) return 0
  const output = serializeSave(document)
  const slotOffset = FILE_OFFSETS.SLOT_TABLE + activeSlot.index * SLOT_SIZE
  return sum32(output, slotOffset + 4, slotOffset + SLOT_SIZE)
}

/** How many bytes differ between the untouched source and the current export. */
export function countChangedBytes(document: SaveDocument): number {
  const output = serializeSave(document)
  let changed = 0
  for (let i = 0; i < output.length; i += 1) {
    if (output[i] !== document.rawBytes[i]) changed += 1
  }
  return changed
}

export function cloneSaveData(data: SaveData): SaveData {
  return {
    headerTitle: data.headerTitle,
    activeSlotIndex: data.activeSlotIndex,
    slots: data.slots.map((slot) => ({
      ...slot,
      characterNames: [...slot.characterNames],
      party: [...slot.party] as [number, number, number],
      characters: slot.characters.map((c) => ({ ...c })),
      inventory: {
        weapon: slot.inventory.weapon.map((i) => ({ ...i })),
        armor: slot.inventory.armor.map((i) => ({ ...i })),
        helmet: slot.inventory.helmet.map((i) => ({ ...i })),
        accessory: slot.inventory.accessory.map((i) => ({ ...i })),
        consumable: slot.inventory.consumable.map((i) => ({ ...i })),
        important: slot.inventory.important.map((i) => ({ ...i })),
      },
    })),
  }
}
