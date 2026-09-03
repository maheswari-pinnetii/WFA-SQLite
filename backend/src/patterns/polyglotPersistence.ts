/**
 * Pattern 15: Polyglot Persistence Architecture
 * Multi-model persistence strategy combining Relational DB (SQLite/Postgres), KV/Cache Store (Redis/Memory), and Event Log Store.
 */

export interface DataStoreSpec {
  storeName: string;
  storeType: 'RELATIONAL_SQL' | 'IN_MEMORY_KV_CACHE' | 'APPEND_ONLY_EVENT_STREAM' | 'DOCUMENT_SEARCH';
  primaryWorkload: string;
  technology: string;
}

export class PolyglotPersistenceCoordinator {
  private stores: Record<string, DataStoreSpec> = {
    relationalStore: {
      storeName: 'Core Transactional DB',
      storeType: 'RELATIONAL_SQL',
      primaryWorkload: 'ACID Transactions, Employee Directory, HR Ledgers',
      technology: 'SQLite WAL / PostgreSQL'
    },
    cacheStore: {
      storeName: 'Session & High-Speed Cache',
      storeType: 'IN_MEMORY_KV_CACHE',
      primaryWorkload: 'Sub-ms Session Tokens, Idempotency Locks, User Rate Limits',
      technology: 'In-Memory Cache-Aside / Redis'
    },
    eventStore: {
      storeName: 'Audit & Attendance Event Stream',
      storeType: 'APPEND_ONLY_EVENT_STREAM',
      primaryWorkload: 'Immutable Punch Log, Compliance Audits, Event Sourcing Replay',
      technology: 'SQLite Event Store / Kafka Log'
    }
  };

  public getStores(): Record<string, DataStoreSpec> {
    return this.stores;
  }
}

export const polyglotPersistenceCoordinator = new PolyglotPersistenceCoordinator();
