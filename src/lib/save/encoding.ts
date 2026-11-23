/**
 * Minimal Shift-JIS support for the game's fixed-width text fields.
 *
 * `TextDecoder` handles reads. `TextEncoder` only emits UTF-8, so the encoder
 * below builds a char -> byte lookup once (lazily) by asking the platform
 * decoder about every legal two-byte sequence. No external data or uploads.
 */

let reverseMap: Map<string, number[]> | null = null

const decoder = new TextDecoder('shift_jis')

function decodeSequence(bytes: number[]): string | null {
  const value = decoder.decode(Uint8Array.from(bytes))
  return value.length === 1 && value !== '\ufffd' ? value : null
}

function getReverseMap(): Map<string, number[]> {
  if (reverseMap) return reverseMap

  const map = new Map<string, number[]>()

  // ASCII range.
  for (let byte = 0x20; byte <= 0x7e; byte += 1) {
    map.set(String.fromCharCode(byte), [byte])
  }

  // Half-width katakana.
  for (let byte = 0xa1; byte <= 0xdf; byte += 1) {
    const value = decodeSequence([byte])
    if (value !== null && !map.has(value)) map.set(value, [byte])
  }

  // Two-byte JIS X 0208 ranges used by Shift-JIS.
  const leadRanges: Array<[number, number]> = [
    [0x81, 0x9f],
    [0xe0, 0xef],
  ]
  for (const [leadStart, leadEnd] of leadRanges) {
    for (let lead = leadStart; lead <= leadEnd; lead += 1) {
      for (let trail = 0x40; trail <= 0xfc; trail += 1) {
        if (trail === 0x7f) continue
        const value = decodeSequence([lead, trail])
        if (value !== null && !map.has(value)) map.set(value, [lead, trail])
      }
    }
  }

  reverseMap = map
  return map
}

/** Decode a NUL-terminated Shift-JIS field; ignores bytes after the first 0x00 or 0xFF. */
export function decodeShiftJis(bytes: Uint8Array, offset: number, maxBytes: number): string {
  let end = offset
  const limit = Math.min(offset + maxBytes, bytes.length)
  if (limit <= offset || bytes[offset] === 0xff || bytes[offset] === 0x00) return ''
  while (end < limit && bytes[end] !== 0 && bytes[end] !== 0xff) end += 1
  return decoder.decode(bytes.subarray(offset, end))
}

/**
 * Encode text into a fixed-width field. Unrepresentable characters become '?'.
 */
export function encodeShiftJis(text: string, maxBytes: number): Uint8Array {
  const map = getReverseMap()
  const output: number[] = []

  for (const char of Array.from(text)) {
    const encoded = map.get(char) ?? [0x3f]
    if (output.length + encoded.length > maxBytes) break
    output.push(...encoded)
  }

  return Uint8Array.from(output)
}

/**
 * Decodes a character/entity name, converting full-width Japanese Latin letters
 * to standard user-friendly characters (e.g., 'Ｃｒｏｎｏ' -> 'Crono').
 */
export function decodeName(bytes: Uint8Array, offset: number, maxBytes: number): string {
  const raw = decodeShiftJis(bytes, offset, maxBytes)
  return raw.normalize('NFKC').trim()
}

/**
 * Converts standard ASCII to full-width (Zenkaku) characters as used natively
 * by Chrono Trigger DS for 5-character name fields (10 bytes Shift-JIS).
 */
export function toFullWidth(str: string): string {
  return str
    .replace(/[\u0021-\u007e]/g, (char) =>
      String.fromCharCode(char.charCodeAt(0) + 0xfee0),
    )
    .replace(/ /g, '\u3000')
}

/**
 * Encodes a name field into Shift-JIS bytes, converting Latin characters to
 * full-width so they render properly in-game without clipping.
 */
export function encodeName(name: string, maxBytes = 10): Uint8Array {
  const zenkaku = toFullWidth(name.trim().slice(0, 5))
  return encodeShiftJis(zenkaku, maxBytes)
}
