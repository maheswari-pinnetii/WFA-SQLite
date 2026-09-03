/**
 * Pattern 1: Sharding Architecture
 * Horizontal partitioning across logical/physical database shards based on a sharding key.
 */
import crypto from 'crypto';

export interface ShardNode {
  id: string;
  name: string;
  connectionString: string;
  isPrimary: boolean;
}

export class ShardRouter {
  private shards: ShardNode[];

  constructor(shards?: ShardNode[]) {
    this.shards = shards || [
      { id: 'shard-0', name: 'Shard Alpha (Org A-I)', connectionString: 'sqlite://./database/sqlite/wfa_shard_0.sqlite', isPrimary: true },
      { id: 'shard-1', name: 'Shard Beta (Org J-R)', connectionString: 'sqlite://./database/sqlite/wfa_shard_1.sqlite', isPrimary: true },
      { id: 'shard-2', name: 'Shard Gamma (Org S-Z)', connectionString: 'sqlite://./database/sqlite/wfa_shard_2.sqlite', isPrimary: true },
    ];
  }

  /**
   * Deterministically maps a key (e.g., organizationId or employeeId) to a target shard ID using MD5 hashing.
   */
  public getShardForKey(key: string): ShardNode {
    const hash = crypto.createHash('md5').update(key).digest('hex');
    const numericHash = parseInt(hash.substring(0, 8), 16);
    const shardIndex = numericHash % this.shards.length;
    return this.shards[shardIndex];
  }

  public getAllShards(): ShardNode[] {
    return this.shards;
  }
}

export const shardRouter = new ShardRouter();
