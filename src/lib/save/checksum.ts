import { SLOT_SIZE } from './constants'
import type { ChecksumAlgorithmId } from './types'

export type ChecksumFn = (
  bytes: Uint8Array,
  start: number,
  endExclusive: number,
) => number

function assertRange(bytes: Uint8Array, start: number, endExclusive: number): void {
  if (
    !Number.isInteger(start) ||
    !Number.isInteger(endExclusive) ||
    start < 0 ||
    endExclusive < start ||
    endExclusive > bytes.length
  ) {
    throw new RangeError(
      `Invalid checksum range ${start}..${endExclusive} for a ${bytes.length}-byte buffer`,
    )
  }
}

/** 32-bit unsigned additive sum used by Chrono Trigger DS for save slots. */
export const sum32: ChecksumFn = (bytes, start, endExclusive) => {
  assertRange(bytes, start, endExclusive)
  let sum = 0
  for (let i = start; i < endExclusive; i += 1) {
    sum = (sum + bytes[i]) >>> 0
  }
  return sum >>> 0
}

/** CRC-16/CCITT-FALSE — poly 0x1021, init 0xFFFF, non-reflected. */
export const crc16Ccitt: ChecksumFn = (bytes, start, endExclusive) => {
  assertRange(bytes, start, endExclusive)
  let crc = 0xffff
  for (let i = start; i < endExclusive; i += 1) {
    crc ^= bytes[i] << 8
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff
    }
  }
  return crc & 0xffff
}

/** CRC-16/IBM (Modbus / ARC) — reflected poly 0xA001, init 0xFFFF. */
export const crc16Ibm: ChecksumFn = (bytes, start, endExclusive) => {
  assertRange(bytes, start, endExclusive)
  let crc = 0xffff
  for (let i = start; i < endExclusive; i += 1) {
    crc ^= bytes[i]
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xa001 : crc >>> 1
    }
  }
  return crc & 0xffff
}

/** Simple 16-bit additive sum. */
export const sum16: ChecksumFn = (bytes, start, endExclusive) => {
  assertRange(bytes, start, endExclusive)
  let sum = 0
  for (let i = start; i < endExclusive; i += 1) sum += bytes[i]
  return sum & 0xffff
}

export const CHECKSUM_ALGORITHMS: Record<ChecksumAlgorithmId, ChecksumFn> = {
  sum32,
  'crc16-ccitt': crc16Ccitt,
  'crc16-ibm': crc16Ibm,
  sum16,
}

export const CHECKSUM_LABELS: Record<ChecksumAlgorithmId, string> = {
  sum32: 'Slot Additive Sum32 (Chrono Trigger DS native)',
  'crc16-ccitt': 'CRC-16/CCITT-FALSE',
  'crc16-ibm': 'CRC-16/IBM (Modbus)',
  sum16: 'Sum16',
}

/** Computes the 32-bit additive checksum for a 0x2800-byte slot (bytes 4..0x2800). */
export function calculateSlotChecksum(slotBytes: Uint8Array): number {
  return sum32(slotBytes, 4, Math.min(SLOT_SIZE, slotBytes.length))
}

export function calculateChecksum(
  bytes: Uint8Array,
  algorithm: ChecksumAlgorithmId,
  start = 4,
  endExclusive = Math.min(SLOT_SIZE, bytes.length),
): number {
  return CHECKSUM_ALGORITHMS[algorithm](bytes, start, endExclusive)
}

export function formatHex32(value: number): string {
  return `0x${(value >>> 0).toString(16).toUpperCase().padStart(8, '0')}`
}

export function formatHex16(value: number): string {
  return `0x${(value & 0xffff).toString(16).toUpperCase().padStart(4, '0')}`
}
