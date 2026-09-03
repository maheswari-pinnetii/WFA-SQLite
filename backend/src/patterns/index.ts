/**
 * Centralized System Design & Database Design Patterns Registry
 */
import { shardRouter } from './sharding.js';
import { replicationManager } from './replication.js';
import { cqrsModule } from './cqrs.js';
import { eventSourcingEngine } from './eventSourcing.js';
import { databasePerServiceManager } from './databasePerService.js';
import { sagaOrchestrator } from './saga.js';
import { materializedViewManager } from './materializedView.js';
import { readReplicaRouter } from './readReplica.js';
import { writeAheadLogManager } from './writeAheadLog.js';
import { indexingAdvisor } from './indexing.js';
import { denormalizationEngine } from './denormalization.js';
import { partitionManager } from './partitioning.js';
import { cacheAsideManager } from './cacheAside.js';
import { starSchemaWarehouse } from './starSchema.js';
import { polyglotPersistenceCoordinator } from './polyglotPersistence.js';
import { defaultBloomFilter } from './bloomFilter.js';
import { defaultConsistentHashRing } from './consistentHashing.js';
import { twoPhaseCommitCoordinator } from './twoPhaseCommit.js';
import { baaSServiceRegistry } from './baasServices.js';

export * from './sharding.js';
export * from './replication.js';
export * from './cqrs.js';
export * from './eventSourcing.js';
export * from './databasePerService.js';
export * from './saga.js';
export * from './materializedView.js';
export * from './readReplica.js';
export * from './writeAheadLog.js';
export * from './indexing.js';
export * from './denormalization.js';
export * from './partitioning.js';
export * from './cacheAside.js';
export * from './starSchema.js';
export * from './polyglotPersistence.js';
export * from './bloomFilter.js';
export * from './consistentHashing.js';
export * from './twoPhaseCommit.js';
export * from './baasServices.js';

export const getSystemDesignPatternsOverview = () => {
  return {
    totalPatternsImplemented: 18,
    patterns: [
      { name: 'Sharding', status: 'IMPLEMENTED', key: 'sharding' },
      { name: 'Replication', status: 'IMPLEMENTED', key: 'replication' },
      { name: 'CQRS', status: 'IMPLEMENTED', key: 'cqrs' },
      { name: 'Event Sourcing', status: 'IMPLEMENTED', key: 'event_sourcing' },
      { name: 'Database Per Service', status: 'IMPLEMENTED', key: 'database_per_service' },
      { name: 'Saga Pattern', status: 'IMPLEMENTED', key: 'saga' },
      { name: 'Materialized View', status: 'IMPLEMENTED', key: 'materialized_view' },
      { name: 'Read Replica', status: 'IMPLEMENTED', key: 'read_replica' },
      { name: 'Write-Ahead Log (WAL)', status: 'IMPLEMENTED', key: 'write_ahead_log' },
      { name: 'Indexing Strategy', status: 'IMPLEMENTED', key: 'indexing' },
      { name: 'Denormalization', status: 'IMPLEMENTED', key: 'denormalization' },
      { name: 'Partitioning', status: 'IMPLEMENTED', key: 'partitioning' },
      { name: 'Cache-Aside', status: 'IMPLEMENTED', key: 'cache_aside' },
      { name: 'Star Schema', status: 'IMPLEMENTED', key: 'star_schema' },
      { name: 'Polyglot Persistence', status: 'IMPLEMENTED', key: 'polyglot_persistence' },
      { name: 'Bloom Filter', status: 'IMPLEMENTED', key: 'bloom_filter' },
      { name: 'Consistent Hashing', status: 'IMPLEMENTED', key: 'consistent_hashing' },
      { name: 'Two-Phase Commit (2PC)', status: 'IMPLEMENTED', key: 'two_phase_commit' }
    ],
    baaSReplacements: baaSServiceRegistry.getBaaSServices()
  };
};
