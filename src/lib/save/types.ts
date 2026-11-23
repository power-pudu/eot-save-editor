import type { DEFAULT_CHECKSUM_ALGORITHM } from './constants'
import type { ItemCategoryId } from './itemNames'

export type SaveFormat = 'sav' | 'dsv' | 'dst' | 'duc'

export type ChecksumAlgorithmId =
  | typeof DEFAULT_CHECKSUM_ALGORITHM
  | 'crc16-ccitt'
  | 'crc16-ibm'
  | 'sum16'

export interface InventoryItem {
  slotIndex: number
  /** In-save 2-byte little-endian item id. */
  itemId: number
  /** In-save 2-byte little-endian quantity. */
  quantity: number
}

export interface CharacterStats {
  id: number // 0: Crono .. 6: Magus
  name: string
  level: number
  curHp: number
  maxHp: number
  curMp: number
  maxMp: number
  baseHp: number
  power: number
  stamina: number
  speed: number
  magic: number
  hit: number
  evade: number
  magicDefense: number
  exp: number
  nextExp: number
}

export interface SlotData {
  index: number // 0, 1, 2
  storedChecksum: number
  calculatedChecksum: number
  isValidChecksum: boolean
  isInitialized: boolean

  // Progress & Minigames
  money: number
  saveCount: number
  playtimeSeconds: number
  silverPoints: number
  catFood: number

  // Names (decoded to standard representation)
  characterNames: string[] // 7 names
  airshipName: string // Epoch
  leadName: string // Active leader / Crono
  nadiaName: string // Princess Nadia

  // Active party member IDs (0..6, or 0xff for none)
  party: [number, number, number]

  // Playable characters stats & state
  characters: CharacterStats[]

  // Categorized inventory
  inventory: Record<ItemCategoryId, InventoryItem[]>
}

/** Fully parsed, editable representation of a save. */
export interface SaveData {
  headerTitle: string
  activeSlotIndex: number
  slots: SlotData[]
}

/**
 * A parsed save plus the untouched original bytes. `rawBytes` never includes a
 * DeSmuME footer; the footer is carried separately by `LoadedSaveFile`.
 */
export interface SaveDocument {
  rawBytes: Uint8Array
  data: SaveData
  /** Read-only header magic (0xFEDCBA98). */
  magic: number
  storedChecksum: number
  checksumAlgorithm: ChecksumAlgorithmId
}

export interface LoadedSaveFile {
  fileName: string
  format: SaveFormat
  /** Container header bytes (e.g. 500-byte ARDS header) or null for raw/dsv saves. */
  header: Uint8Array | null
  /** Exact footer bytes (including any CRLF) or null for a plain `.sav`. */
  footer: Uint8Array | null
  /** The complete original file: header + save bytes + footer. */
  originalBytes: Uint8Array
  document: SaveDocument
}
