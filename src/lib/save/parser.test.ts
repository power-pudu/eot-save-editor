import { describe, expect, it } from 'vitest'
import {
  calculateSlotChecksum,
  crc16Ccitt,
  crc16Ibm,
} from './checksum'
import {
  FILE_OFFSETS,
  SAVE_MAGIC,
  SLOT_OFFSETS,
  SLOT_SIZE,
} from './constants'
import { createDemoSaveBytes } from './demo'
import { decodeName, encodeName } from './encoding'
import { CT_EXP_TO_NEXT } from './expTable'
import { getItemCategory, getItemName } from './itemNames'
import {
  countChangedBytes,
  parseSave,
  SaveParseError,
  serializeSave,
} from './parser'

describe('parse / serialize round-trip', () => {
  it('parses the generated demo save without altering it', () => {
    const demo = createDemoSaveBytes()
    const document = parseSave(demo)

    expect(document.magic).toBe(SAVE_MAGIC)
    expect(document.data.slots).toHaveLength(3)

    const slot0 = document.data.slots[0]
    expect(slot0.characterNames[0]).toBe('Crono')
    expect(slot0.airshipName).toBe('Epoch')
    expect(slot0.characters[0].curHp).toBe(750)
    expect(slot0.isValidChecksum).toBe(true)

    // Unmodified serializeSave must produce byte-for-byte identical bytes
    expect(serializeSave(document)).toEqual(demo)
    expect(countChangedBytes(document)).toBe(0)
  })

  it('updates character names and slot checksums on modification', () => {
    const demo = createDemoSaveBytes()
    const document = parseSave(demo)

    const slot0 = document.data.slots[0]
    slot0.characterNames[0] = 'Cronx'
    slot0.money = 9999999

    const output = serializeSave(document)
    expect(countChangedBytes(document)).toBeGreaterThan(0)

    const reloaded = parseSave(output)
    expect(reloaded.data.slots[0].characterNames[0]).toBe('Cronx')
    expect(reloaded.data.slots[0].money).toBe(9999999)
    expect(reloaded.data.slots[0].isValidChecksum).toBe(true)
  })

  it('safely falls back to default character names if blank names are serialized', () => {
    const demo = createDemoSaveBytes()
    const document = parseSave(demo)

    const slot0 = document.data.slots[0]
    slot0.characterNames[0] = ''
    slot0.characterNames[1] = '   '

    const output = serializeSave(document)
    const reloaded = parseSave(output)

    expect(reloaded.data.slots[0].characterNames[0]).toBe('Crono')
    expect(reloaded.data.slots[0].characterNames[1]).toBe('Marle')
  })

  it('updates item quantities and persists them correctly', () => {
    const demo = createDemoSaveBytes()
    const document = parseSave(demo)

    const slot0 = document.data.slots[0]
    // Add 99 Potions (0x4001) in consumable slot 0
    slot0.inventory.consumable[0] = { slotIndex: 0, itemId: 0x4001, quantity: 99 }

    const output = serializeSave(document)
    const reloaded = parseSave(output)

    expect(reloaded.data.slots[0].inventory.consumable[0].itemId).toBe(0x4001)
    expect(reloaded.data.slots[0].inventory.consumable[0].quantity).toBe(99)
    expect(getItemName(0x4001)).toBe('Potion')
    expect(reloaded.data.slots[0].isValidChecksum).toBe(true)
  })

  it('updates character stats correctly', () => {
    const demo = createDemoSaveBytes()
    const document = parseSave(demo)

    const crono = document.data.slots[0].characters[0]
    crono.level = 99
    crono.curHp = 999
    crono.maxHp = 999
    crono.curMp = 99
    crono.maxMp = 99
    crono.power = 99
    crono.speed = 16

    const output = serializeSave(document)
    const reloaded = parseSave(output)
    const reloadedCrono = reloaded.data.slots[0].characters[0]

    expect(reloadedCrono.level).toBe(99)
    expect(reloadedCrono.curHp).toBe(999)
    expect(reloadedCrono.maxHp).toBe(999)
    expect(reloadedCrono.curMp).toBe(99)
    expect(reloadedCrono.maxMp).toBe(99)
    expect(reloadedCrono.power).toBe(99)
    expect(reloadedCrono.speed).toBe(16)
    expect(reloaded.data.slots[0].isValidChecksum).toBe(true)
  })

  it('round-trips save location, writes the 0x434 copy, and leaves facing and untouched slots intact', () => {
    const demo = createDemoSaveBytes()
    const slot0Offset = FILE_OFFSETS.SLOT_TABLE
    const slot1Offset = FILE_OFFSETS.SLOT_TABLE + SLOT_SIZE
    const demoView = new DataView(demo.buffer, demo.byteOffset, demo.byteLength)

    // Seed slot 0 with an initial location and non-zero facing byte at 0x42C, then fix checksum
    demoView.setUint16(slot0Offset + SLOT_OFFSETS.LOCATION, 0x00d, true)
    demoView.setUint8(slot0Offset + SLOT_OFFSETS.LOCATION_X, 4)
    demoView.setUint8(slot0Offset + SLOT_OFFSETS.LOCATION_Y, 24)
    demoView.setUint8(slot0Offset + 0x042c, 3) // facing byte
    demoView.setUint16(slot0Offset + SLOT_OFFSETS.LOCATION_COPY, 0x00d, true)
    demoView.setUint32(
      slot0Offset + SLOT_OFFSETS.CHECKSUM,
      calculateSlotChecksum(demo.subarray(slot0Offset, slot0Offset + SLOT_SIZE)),
      true,
    )

    // Untouched slot must serialize byte-identical
    const untouchedDoc = parseSave(demo)
    expect(untouchedDoc.data.slots[0].location).toBe(0x00d)
    expect(untouchedDoc.data.slots[0].locationX).toBe(4)
    expect(untouchedDoc.data.slots[0].locationY).toBe(24)
    expect(serializeSave(untouchedDoc)).toEqual(demo)
    expect(countChangedBytes(untouchedDoc)).toBe(0)

    // Edit slot 0 to Algetty (0x17C, 42, 42)
    untouchedDoc.data.slots[0].location = 0x17c
    untouchedDoc.data.slots[0].locationX = 42
    untouchedDoc.data.slots[0].locationY = 42

    const output = serializeSave(untouchedDoc)
    const outView = new DataView(output.buffer, output.byteOffset, output.byteLength)

    // Verify 0x428, 0x42A, 0x42B, and second copy at 0x434
    expect(outView.getUint16(slot0Offset + SLOT_OFFSETS.LOCATION, true)).toBe(0x17c)
    expect(outView.getUint8(slot0Offset + SLOT_OFFSETS.LOCATION_X)).toBe(42)
    expect(outView.getUint8(slot0Offset + SLOT_OFFSETS.LOCATION_Y)).toBe(42)
    expect(outView.getUint16(slot0Offset + SLOT_OFFSETS.LOCATION_COPY, true)).toBe(0x17c)

    // Facing byte at 0x42C must remain untouched
    expect(outView.getUint8(slot0Offset + 0x042c)).toBe(3)

    // Untouched slots (1 and 2) must remain byte-identical
    expect(output.subarray(slot1Offset)).toEqual(demo.subarray(slot1Offset))

    // Reload and verify round-trip and checksum
    const reloaded = parseSave(output)
    expect(reloaded.data.slots[0].location).toBe(0x17c)
    expect(reloaded.data.slots[0].locationX).toBe(42)
    expect(reloaded.data.slots[0].locationY).toBe(42)
    expect(reloaded.data.slots[0].isValidChecksum).toBe(true)
  })

  it('rejects invalid sizes with a clear error', () => {
    expect(() => parseSave(new Uint8Array(1024))).toThrow(SaveParseError)
    expect(() => parseSave(new Uint8Array(1024))).toThrow(/64 KB/)
  })

  it('losslessly parses and serializes real CT.sav sample', async () => {
    const fs = await import('node:fs')
    const path = await import('node:path')
    const samplePath = path.resolve('CT.sav')
    if (!fs.existsSync(samplePath)) return

    const fileBytes = new Uint8Array(fs.readFileSync(samplePath))
    const doc = parseSave(fileBytes)

    expect(doc.magic).toBe(SAVE_MAGIC)
    expect(doc.data.slots[0].characterNames[0]).toBe('Crono')
    expect(doc.data.slots[0].characterNames[1]).toBe('Marle')
    expect(doc.data.slots[0].characterNames[4]).toBe('Glenn')
    expect(doc.data.slots[0].airshipName).toBe('Epoch')
    expect(doc.data.slots[0].nadiaName).toBe('Nadia')
    expect(doc.data.slots[0].money).toBe(9999999)
    expect(doc.data.slots[0].isValidChecksum).toBe(true)
    expect(doc.data.slots[1].isValidChecksum).toBe(true)
    expect(doc.data.slots[2].isValidChecksum).toBe(true)

    // Lossless round-trip
    expect(serializeSave(doc)).toEqual(fileBytes)
    expect(countChangedBytes(doc)).toBe(0)
  })

  it('writes character level at the verified offset (record + 0x19)', async () => {
    const fs = await import('node:fs')
    const path = await import('node:path')
    const samplePath = path.resolve('CT.sav')
    if (!fs.existsSync(samplePath)) return

    const fileBytes = new Uint8Array(fs.readFileSync(samplePath))
    const doc = parseSave(fileBytes)

    // Frog is character ID 4
    const frog = doc.data.slots[0].characters[4]
    expect(frog.level).toBe(62)
    // +0x3A countdown matches save data
    expect(frog.nextExp).toBe(11853)

    // Edit Frog level to 82 (0x52) and sync nextExp to table value
    frog.level = 82
    frog.nextExp = CT_EXP_TO_NEXT[82] // 36290
    const output = serializeSave(doc)

    // Frog record offset in file: 0x0028 (slot 0) + 0x045C + 4 * 0x60 = 0x0604
    // Level is at 0x0604 + 0x19 = 0x061D
    expect(output[0x061D]).toBe(82) // 0x52

    // Verify offset 0x0636 (record + 0x32) was NOT overwritten with 82
    expect(output[0x0636]).not.toBe(82)

    // Verify +0x3A (0x0604 + 0x3A = 0x063E) holds 36290
    const outView = new DataView(output.buffer, output.byteOffset, output.byteLength)
    expect(outView.getUint16(0x063e, true)).toBe(36290)

    // Re-parse and verify level persists as 82 and nextExp as 36290
    const reloaded = parseSave(output)
    expect(reloaded.data.slots[0].characters[4].level).toBe(82)
    expect(reloaded.data.slots[0].characters[4].nextExp).toBe(36290)
    expect(reloaded.data.slots[0].isValidChecksum).toBe(true)
  })
})

describe('checksum helpers', () => {
  const message = new TextEncoder().encode('123456789')

  it('matches standard CRC-16 test vectors', () => {
    expect(crc16Ccitt(message, 0, message.length)).toBe(0x29b1)
    expect(crc16Ibm(message, 0, message.length)).toBe(0x4b37)
  })

  it('correctly detects initialized vs uninitialized slots in sample saves', async () => {
    const fs = await import('node:fs')
    const path = await import('node:path')
    const samplePath = path.resolve('sample.duc')
    if (!fs.existsSync(samplePath)) return

    const fileBytes = new Uint8Array(fs.readFileSync(samplePath))
    // 500-byte ARDS header
    const rawSave = fileBytes.slice(500, 500 + 65536)
    const doc = parseSave(rawSave)

    expect(doc.data.slots[0].isInitialized).toBe(true)
    expect(doc.data.slots[0].isValidChecksum).toBe(true)
    expect(doc.data.slots[0].characterNames[0]).toBe('Crono')

    expect(doc.data.slots[1].isInitialized).toBe(false)
    expect(doc.data.slots[1].isValidChecksum).toBe(false)
    expect(doc.data.slots[1].money).toBe(0)
    expect(doc.data.slots[1].characterNames[0]).toBe('Crono') // clean fallback, no ????

    expect(doc.data.slots[2].isInitialized).toBe(false)
    expect(doc.data.slots[2].isValidChecksum).toBe(false)
    expect(doc.data.slots[2].money).toBe(0)

    // Unmodified serialize preserves exact original bytes for uninitialized slots 1 and 2
    const serialized = serializeSave(doc)
    const slot1And2Offset = 0x0028 + SLOT_SIZE
    expect(serialized.subarray(slot1And2Offset)).toEqual(rawSave.subarray(slot1And2Offset))
  })

  it('calculates 32-bit slot checksum correctly', () => {
    const slot = new Uint8Array(SLOT_SIZE)
    slot.fill(1)
    // 4 to 0x2800 is (0x2800 - 4) = 10236 bytes of 1
    expect(calculateSlotChecksum(slot)).toBe(10236)
  })
})

describe('Shift-JIS text and name fields', () => {
  it('round-trips Zenkaku character names', () => {
    const encoded = encodeName('Crono')
    expect(decodeName(encoded, 0, encoded.length)).toBe('Crono')
  })

  it('resolves item names and categories properly', () => {
    expect(getItemName(0x0006)).toBe('Mammoth Tusk')
    expect(getItemName(0x1008)).toBe('Ruby Vest')
    expect(getItemName(0x4001)).toBe('Potion')
    expect(getItemName(0x400c)).toBe('Shelter')
    expect(getItemCategory(0x4001)?.id).toBe('consumable')
  })
})
