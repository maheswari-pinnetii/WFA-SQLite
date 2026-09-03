/**
 * Pattern 17: Consistent Hashing Ring
 * Hash ring distributor with virtual nodes for dynamic node placement, uniform load distribution, and minimal key migration.
 */
import crypto from 'crypto';

export interface VirtualNode {
  hash: number;
  nodeId: string;
}

export class ConsistentHashRing {
  private ring: VirtualNode[] = [];
  private virtualNodeCount: number;

  constructor(virtualNodeCount: number = 3) {
    this.virtualNodeCount = virtualNodeCount;
  }

  private hashKey(key: string): number {
    const hash = crypto.createHash('md5').update(key).digest('hex');
    return parseInt(hash.substring(0, 8), 16);
  }

  public addNode(nodeId: string): void {
    for (let i = 0; i < this.virtualNodeCount; i++) {
      const vKey = `${nodeId}-vnode-${i}`;
      const hash = this.hashKey(vKey);
      this.ring.push({ hash, nodeId });
    }
    this.ring.sort((a, b) => a.hash - b.hash);
  }

  public removeNode(nodeId: string): void {
    this.ring = this.ring.filter(vn => vn.nodeId !== nodeId);
  }

  public getNode(key: string): string | null {
    if (this.ring.length === 0) return null;
    const hash = this.hashKey(key);

    for (const vn of this.ring) {
      if (vn.hash >= hash) {
        return vn.nodeId;
      }
    }

    return this.ring[0].nodeId; // Wrap around ring
  }

  public getRingDetails(): { totalVirtualNodes: number; nodes: string[] } {
    const unique = Array.from(new Set(this.ring.map(r => r.nodeId)));
    return {
      totalVirtualNodes: this.ring.length,
      nodes: unique
    };
  }
}

export const defaultConsistentHashRing = new ConsistentHashRing();
defaultConsistentHashRing.addNode('node-alpha-us');
defaultConsistentHashRing.addNode('node-beta-eu');
defaultConsistentHashRing.addNode('node-gamma-ap');
