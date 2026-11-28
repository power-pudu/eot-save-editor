/**
 * Layout constants for the Chrono Trigger DS save editor.
 *
 * Verified against the supplied 64 KB sample save:
 *   - global magic 0xFEDCBA98 at 0x0000
 *   - three 0x2800-byte save slots starting at 0x0028
 *   - each slot starts with a 32-bit additive checksum
 *   - the checksum is the sum of bytes slot+4 .. slot+0x27FF
 *
 * All slot-relative offsets below are relative to the start of a slot
 * (0x0028, 0x2828, 0x5028).
 */

export const SAVE_SIZE_BYTES = 64 * 1024

/** Sizes accepted by the loader (kept as a list for easy expansion). */
export const EXPECTED_SAVE_SIZES: readonly number[] = [SAVE_SIZE_BYTES]

/** DeSmuME appends this ASCII marker to `.dsv` saves. */
export const DESMUME_FOOTER_MARKER = '|<--Snip above here'

/** Action Replay DS / Datel container format constants (.dst / .duc). */
export const ARDS_HEADER_MAGIC = 'ARDS000000000001'
export const ARDS_HEADER_SIZE = 500 // 0x01F4

/** Confirmed from the sample save. */
export const SAVE_MAGIC = 0xfedcba98

/** The game's three save slots. */
export const SLOT_COUNT = 3
export const SLOT_SIZE = 0x2800
export const SLOT_CHECKSUM_SIZE = 4

export const FILE_OFFSETS = {
  MAGIC: 0x0000,
  HEADER_TEXT: 0x0004,
  /** First slot begins here; slot N begins at SLOT_TABLE + N * SLOT_SIZE. */
  SLOT_TABLE: 0x0028,
} as const

/** Offsets relative to the start of one 0x2800-byte save slot. */
export const SLOT_OFFSETS = {
  CHECKSUM: 0x0000,
  /** Start of the 0x200-byte story/quest flag bank ($7F0000-$7F01FF). Offset 0x0228 itself is the storyline counter. */
  FLAG_BANK: 0x0228,
  /** Byte length of the story/quest flag bank (0x0228..0x0427). */
  FLAG_BANK_SIZE: 0x200,
  /** 1 byte: silver points. */
  SILVER_POINTS: 0x027a,
  /** 1 byte: cat food. */
  CAT_FOOD: 0x0287,
  /** 2-byte little-endian location id. */
  LOCATION: 0x0428,
  /** 1-byte party tile X coordinate. */
  LOCATION_X: 0x042a,
  /** 1-byte party tile Y coordinate. */
  LOCATION_Y: 0x042b,
  /** 2-byte little-endian second copy of the location id (must match LOCATION). */
  LOCATION_COPY: 0x0434,
  /** 7 characters, 0x60 bytes each (starts at slot offset 0x045C). */
  CHARACTERS_DATA: 0x045c,
  /** Inventory category start offsets */
  WEAPONS: 0x06fc,
  ARMOR: 0x08b8,
  HELMETS: 0x0980,
  ACCESSORIES: 0x0a1c,
  CONSUMABLES: 0x0b08,
  KEY_ITEMS: 0x0bb4,
  /** 7 character names, 16 bytes apart (10-byte Shift-JIS field + padding). */
  CHARACTER_NAMES: 0x0c98,
  /** 10-byte Shift-JIS airship name. */
  AIRSHIP_NAME: 0x0d08,
  /** 10-byte copy of the lead character's name used by the slot summary. */
  MAIN_CHARACTER_NAME: 0x0d18,
  /** 10-byte Shift-JIS Nadia name (Princess Nadia / Marle's true name). */
  NADIA_NAME: 0x0d28,
  /** Three 1-byte character ids: party slot 1, 2, 3. */
  PARTY: 0x0d38,
  /** 4-byte little-endian gold. */
  MONEY: 0x0d44,
  /** 4-byte little-endian save counter. */
  SAVE_COUNT: 0x0d48,
  /** 4-byte little-endian play time in seconds. */
  PLAYTIME: 0x0d4c,
  /** Second copy of the play time used by the save-slot summary. */
  PLAYTIME_SUMMARY: 0x21e8,
} as const

export const CHARACTER_DATA_STRIDE = 0x60
export const CHARACTER_NAME_STRIDE = 16

export const FIELD_SIZES = {
  HEADER_TEXT: 32,
  CHARACTER_NAME: 10,
  AIRSHIP_NAME: 10,
  MAIN_CHARACTER_NAME: 10,
  NADIA_NAME: 10,
  CHARACTER_STRIDE: 16,
  CHARACTER_DATA_STRIDE: 0x60,
  /** Each inventory entry is a 2-byte item id followed by a 2-byte count. */
  ITEM_SLOT: 4,
} as const

/** In-game character ids, in save order. */
export const CHARACTER_LABELS = [
  'Crono',
  'Marle',
  'Lucca',
  'Robo',
  'Frog',
  'Ayla',
  'Magus',
] as const

export const CHARACTER_COUNT = CHARACTER_LABELS.length

/** `max` is what the UI allows; the writer keeps wider values intact. */
export const FIELD_LIMITS = {
  money: { min: 0, max: 9_999_999, storageMax: 0xffffffff },
  saveCount: { min: 0, max: 9_999_999, storageMax: 0xffffffff },
  /** Stored as total seconds in a u32; the UI splits it into h/m/s. */
  playtimeSeconds: { min: 0, max: 359_999_999, storageMax: 0xffffffff },
  silverPoints: { min: 0, max: 255, storageMax: 0xff },
  catFood: { min: 0, max: 255, storageMax: 0xff },
  characterNameChars: 5,
  airshipNameChars: 5,
  partyMember: { min: 0, max: CHARACTER_COUNT - 1 },
  itemQuantity: { min: 0, max: 99, storageMax: 0xffff },
  level: { min: 1, max: 99, storageMax: 99 },
  hp: { min: 1, max: 999, storageMax: 999 },
  mp: { min: 0, max: 99, storageMax: 99 },
  stat: { min: 1, max: 99, storageMax: 99 },
  speed: { min: 1, max: 16, storageMax: 16 },
  exp: { min: 0, max: 9_999_999, storageMax: 0xffffffff },
} as const

export const DEFAULT_CHECKSUM_ALGORITHM = 'sum32' as const
