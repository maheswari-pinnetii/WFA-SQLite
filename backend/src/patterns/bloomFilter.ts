/**
 * Pattern 16: Bloom Filter (Probabilistic Membership Filter)
 * Ultra-fast probabilistic structure returning:
 * - "Definitely NOT in set" (100% accurate, zero false negatives)
 * - "Might be in set" (low false positive rate).
 */
import crypto from 'crypto';

export class BloomFilter {
  private size: number;
  private bitArray: Uint8Array;
  private hashCount: number;

  constructor(size: number = 1024, hashCount: number = 3) {
    this.size = size;
    this.bitArray = new Uint8Array(Math.ceil(size / 8));
    this.hashCount = hashCount;
  }

  private getHashes(item: string): number[] {
    const hashes: number[] = [];
    for (let i = 0; i < this.hashCount; i++) {
      const hash = crypto.createHash('sha256').update(`${item}:${i}`).digest('hex');
      const idx = parseInt(hash.substring(0, 8), 16) % this.size;
      hashes.push(idx);
    }
    return hashes;
  }

  public add(item: string): void {
    const indices = this.getHashes(item);
    for (const idx of indices) {
      const byteIdx = Math.floor(idx / 8);
      const bitIdx = idx % 8;
      this.bitArray[byteIdx] |= (1 << bitIdx);
    }
  }

  public mayContain(item: string): boolean {
    const indices = this.getHashes(item);
    for (const idx of indices) {
      const byteIdx = Math.floor(idx / 8);
      const bitIdx = idx % 8;
      if ((this.bitArray[byteIdx] & (1 << bitIdx)) === 0) {
        return false; // Definitely not present
      }
    }
    return true; // Might be present
  }
}

export const defaultBloomFilter = new BloomFilter();
