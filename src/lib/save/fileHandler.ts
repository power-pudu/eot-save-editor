import {
  ARDS_HEADER_MAGIC,
  ARDS_HEADER_SIZE,
  DESMUME_FOOTER_MARKER,
  EXPECTED_SAVE_SIZES,
  SAVE_SIZE_BYTES,
} from './constants'
import { assertSaveSize, parseSave, SaveParseError } from './parser'
import type { LoadedSaveFile, SaveFormat } from './types'

export class SaveFileError extends Error {
  override name = 'SaveFileError'
}

function encodeAscii(text: string): Uint8Array {
  return Uint8Array.from(Array.from(text, (char) => char.charCodeAt(0) & 0xff))
}

const markerBytes = encodeAscii(DESMUME_FOOTER_MARKER)
const ardsMarkerBytes = encodeAscii(ARDS_HEADER_MAGIC)

function matchesAt(bytes: Uint8Array, index: number, pattern: Uint8Array): boolean {
  if (index < 0 || index + pattern.length > bytes.length) return false
  for (let i = 0; i < pattern.length; i += 1) {
    if (bytes[index + i] !== pattern[i]) return false
  }
  return true
}

/** Check if the file starts with the Action Replay DS header signature. */
export function isArdsHeader(bytes: Uint8Array): boolean {
  return bytes.length >= ardsMarkerBytes.length && matchesAt(bytes, 0, ardsMarkerBytes)
}

/** Search only the tail so we never mistake save data for a footer. */
function findFooterMarker(bytes: Uint8Array): number | null {
  const earliest = Math.max(0, bytes.length - 512)
  for (let i = bytes.length - markerBytes.length; i >= earliest; i -= 1) {
    if (matchesAt(bytes, i, markerBytes)) return i
  }
  return null
}

function validateSaveSize(saveBytes: Uint8Array, removedFooter: boolean): void {
  if (EXPECTED_SAVE_SIZES.includes(saveBytes.length)) return
  const expected = EXPECTED_SAVE_SIZES.map((size) => `${size / 1024} KB`).join(' or ')
  const suffix = removedFooter ? ' after removing the DeSmuME footer' : ''
  throw new SaveFileError(
    `Invalid save size${suffix}: expected ${expected} (${SAVE_SIZE_BYTES} bytes), ` +
      `got ${saveBytes.length} bytes. The file may be truncated, from a different game, ` +
      `or not a raw save.`,
  )
}

export function detectFormat(fileName: string, bytes?: Uint8Array): SaveFormat {
  const lower = fileName.toLowerCase()
  if (lower.endsWith('.dst')) return 'dst'
  if (lower.endsWith('.duc')) return 'duc'
  if (lower.endsWith('.dsv')) return 'dsv'
  if (bytes && isArdsHeader(bytes)) return 'duc'
  return 'sav'
}

export interface SplitFileBytes {
  /** Container header (e.g. 500-byte ARDS header), or null. */
  header: Uint8Array | null
  /** Exactly 64 KB of raw save data. */
  saveBytes: Uint8Array
  /** The original DeSmuME footer, trailing padding, or null. */
  footer: Uint8Array | null
}

/**
 * Separate container headers (such as Action Replay DS .dst / .duc) or DeSmuME
 * `.dsv` footers from the raw save without normalizing or re-encoding any of
 * their bytes.
 */
export function splitFileBytes(fileBytes: Uint8Array): SplitFileBytes {
  // Action Replay DS container (.dst / .duc)
  if (isArdsHeader(fileBytes)) {
    if (fileBytes.length < ARDS_HEADER_SIZE + SAVE_SIZE_BYTES) {
      throw new SaveFileError(
        `Truncated Action Replay DS file: expected at least ${
          ARDS_HEADER_SIZE + SAVE_SIZE_BYTES
        } bytes, got ${fileBytes.length} bytes.`,
      )
    }
    const header = fileBytes.slice(0, ARDS_HEADER_SIZE)
    const saveBytes = fileBytes.slice(ARDS_HEADER_SIZE, ARDS_HEADER_SIZE + SAVE_SIZE_BYTES)
    const footer =
      fileBytes.length > ARDS_HEADER_SIZE + SAVE_SIZE_BYTES
        ? fileBytes.slice(ARDS_HEADER_SIZE + SAVE_SIZE_BYTES)
        : null
    return { header, saveBytes, footer }
  }

  const markerOffset = findFooterMarker(fileBytes)

  if (markerOffset === null) {
    validateSaveSize(fileBytes, false)
    return { header: null, saveBytes: fileBytes.slice(), footer: null }
  }

  // DeSmuME may put a CRLF/LF in front of the marker. Prefer the candidate that
  // leaves an exact 64 KB save; otherwise keep the marker itself as the footer.
  const candidates = [markerOffset]
  if (fileBytes[markerOffset - 1] === 0x0a) candidates.unshift(markerOffset - 1)
  if (fileBytes[markerOffset - 2] === 0x0d && fileBytes[markerOffset - 1] === 0x0a) {
    candidates.unshift(markerOffset - 2)
  }
  const footerOffset =
    candidates.find((candidate) => EXPECTED_SAVE_SIZES.includes(candidate)) ?? markerOffset

  const saveBytes = fileBytes.slice(0, footerOffset)
  validateSaveSize(saveBytes, true)
  return { header: null, saveBytes, footer: fileBytes.slice(footerOffset) }
}

/** Reattach the exact original header and footer bytes for export. */
export function joinSaveBytes(
  saveBytes: Uint8Array,
  header: Uint8Array | null = null,
  footer: Uint8Array | null = null,
): Uint8Array {
  assertSaveSize(saveBytes)
  const headerLen = header?.length ?? 0
  const footerLen = footer?.length ?? 0
  const output = new Uint8Array(headerLen + saveBytes.length + footerLen)
  if (header) output.set(header, 0)
  output.set(saveBytes, headerLen)
  if (footer) output.set(footer, headerLen + saveBytes.length)
  return output
}

export function buildEditedFileName(fileName: string): string {
  const dot = fileName.lastIndexOf('.')
  if (dot <= 0) return `${fileName}_edited`
  return `${fileName.slice(0, dot)}_edited${fileName.slice(dot)}`
}

export async function loadSaveFile(file: File): Promise<LoadedSaveFile> {
  try {
    const fileBytes = new Uint8Array(await file.arrayBuffer())
    const { header, saveBytes, footer } = splitFileBytes(fileBytes)
    return {
      fileName: file.name,
      format: detectFormat(file.name, fileBytes),
      header,
      footer,
      originalBytes: fileBytes,
      document: parseSave(saveBytes),
    }
  } catch (error) {
    if (error instanceof SaveFileError || error instanceof SaveParseError) throw error
    const detail = error instanceof Error ? error.message : String(error)
    throw new SaveFileError(`Could not read "${file.name}": ${detail}`)
  }
}

export function createEditedBlob(loaded: LoadedSaveFile, editedSaveBytes: Uint8Array): Blob {
  const bytes = joinSaveBytes(editedSaveBytes, loaded.header, loaded.footer)
  return new Blob([bytes], { type: 'application/octet-stream' })
}

/** Browser-only download helper. */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
