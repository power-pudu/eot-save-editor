import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  ARDS_HEADER_MAGIC,
  ARDS_HEADER_SIZE,
  DESMUME_FOOTER_MARKER,
  SAVE_MAGIC,
  SAVE_SIZE_BYTES,
} from './constants'
import {
  buildEditedFileName,
  detectFormat,
  isArdsHeader,
  joinSaveBytes,
  SaveFileError,
  splitFileBytes,
} from './fileHandler'
import { parseSave } from './parser'

const footerText = `${DESMUME_FOOTER_MARKER} to make a .SAV file\r\n`
const footerBytes = new TextEncoder().encode(footerText)

function makeSave(): Uint8Array {
  const save = new Uint8Array(SAVE_SIZE_BYTES)
  save.fill(0xcd)
  return save
}

function makeArdsFile(saveBytes: Uint8Array, trailerLength = 1024): Uint8Array {
  const ardsMagic = new TextEncoder().encode(ARDS_HEADER_MAGIC)
  const header = new Uint8Array(ARDS_HEADER_SIZE)
  header.set(ardsMagic, 0)
  // Fill remaining header metadata with dummy values
  for (let i = ardsMagic.length; i < header.length; i += 1) {
    header[i] = i & 0xff
  }
  const trailer = new Uint8Array(trailerLength)
  trailer.fill(0xff)

  const fileBytes = new Uint8Array(header.length + saveBytes.length + trailer.length)
  fileBytes.set(header, 0)
  fileBytes.set(saveBytes, header.length)
  fileBytes.set(trailer, header.length + saveBytes.length)
  return fileBytes
}

describe('fileHandler', () => {
  it('detects the format from the extension', () => {
    expect(detectFormat('game.SAV')).toBe('sav')
    expect(detectFormat('game.dsv')).toBe('dsv')
    expect(detectFormat('game.dst')).toBe('dst')
    expect(detectFormat('game.duc')).toBe('duc')
  })

  it('detects ARDS format from content bytes', () => {
    const ardsBytes = makeArdsFile(makeSave())
    expect(isArdsHeader(ardsBytes)).toBe(true)
    expect(detectFormat('unnamed_file', ardsBytes)).toBe('duc')
  })

  it('preserves a plain 64 KB save byte-for-byte', () => {
    const save = makeSave()
    const split = splitFileBytes(save)

    expect(split.header).toBeNull()
    expect(split.footer).toBeNull()
    expect(split.saveBytes).toEqual(save)
    expect(joinSaveBytes(split.saveBytes, split.header, split.footer)).toEqual(save)
  })

  it('separates and re-appends a DeSmuME footer exactly', () => {
    const save = makeSave()
    const original = joinSaveBytes(save, null, footerBytes)
    const split = splitFileBytes(original)

    expect(split.header).toBeNull()
    expect(split.saveBytes).toEqual(save)
    expect(split.footer).toEqual(footerBytes)
    expect(joinSaveBytes(split.saveBytes, split.header, split.footer)).toEqual(original)
  })

  it('keeps a CRLF immediately before the footer marker', () => {
    const save = makeSave()
    const footerWithCrlf = new Uint8Array([0x0d, 0x0a, ...footerBytes])
    const original = joinSaveBytes(save, null, footerWithCrlf)
    const split = splitFileBytes(original)

    expect(split.header).toBeNull()
    expect(split.saveBytes).toHaveLength(SAVE_SIZE_BYTES)
    expect(split.footer).toEqual(footerWithCrlf)
    expect(joinSaveBytes(split.saveBytes, split.header, split.footer)).toEqual(original)
  })

  it('separates and re-assembles an Action Replay DS (.dst / .duc) file byte-for-byte', () => {
    const save = makeSave()
    const original = makeArdsFile(save, 196608)
    const split = splitFileBytes(original)

    expect(split.header).not.toBeNull()
    expect(split.header).toHaveLength(ARDS_HEADER_SIZE)
    expect(split.saveBytes).toEqual(save)
    expect(split.footer).toHaveLength(196608)
    expect(joinSaveBytes(split.saveBytes, split.header, split.footer)).toEqual(original)
  })

  it('rejects truncated Action Replay DS files', () => {
    const truncated = new Uint8Array(ARDS_HEADER_SIZE + 100)
    truncated.set(new TextEncoder().encode(ARDS_HEADER_MAGIC), 0)

    expect(() => splitFileBytes(truncated)).toThrow(SaveFileError)
    expect(() => splitFileBytes(truncated)).toThrow(/Truncated Action Replay DS file/)
  })

  it('reports invalid sizes clearly', () => {
    expect(() => splitFileBytes(new Uint8Array(100))).toThrow(SaveFileError)
    expect(() => splitFileBytes(new Uint8Array(100))).toThrow(/Invalid save size/)
  })

  it('builds an edited filename while keeping the extension', () => {
    expect(buildEditedFileName('CT.sav')).toBe('CT_edited.sav')
    expect(buildEditedFileName('CT.dsv')).toBe('CT_edited.dsv')
    expect(buildEditedFileName('chrono-trigger.22851.dst')).toBe('chrono-trigger.22851_edited.dst')
    expect(buildEditedFileName('chrono-trigger.18311.duc')).toBe('chrono-trigger.18311_edited.duc')
  })

  it('parses real sample.dst and sample.duc files when present in workspace', () => {
    for (const filename of ['sample.dst', 'sample.duc']) {
      const filepath = path.resolve(filename)
      if (!fs.existsSync(filepath)) continue
      const bytes = new Uint8Array(fs.readFileSync(filepath))
      const split = splitFileBytes(bytes)
      expect(split.header).toHaveLength(ARDS_HEADER_SIZE)
      expect(split.saveBytes).toHaveLength(SAVE_SIZE_BYTES)
      const doc = parseSave(split.saveBytes)
      expect(doc.magic).toBe(SAVE_MAGIC)
      expect(doc.data.slots).toHaveLength(3)
      const rejoined = joinSaveBytes(split.saveBytes, split.header, split.footer)
      expect(rejoined).toEqual(bytes)
    }
  })
})
