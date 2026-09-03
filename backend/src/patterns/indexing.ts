/**
 * Pattern 10: Database Indexing Strategy
 * Manages compound, unique, covered, and partial B-Tree indexes for ultra-fast query execution.
 */
import { getDb } from '../config/db.js';

export interface IndexDetail {
  name: string;
  table: string;
  unique: boolean;
  columns: string[];
}

export class IndexingAdvisor {
  public listIndexes(): IndexDetail[] {
    const db = getDb();
    const rows = db.prepare(`SELECT name, tbl_name FROM sqlite_master WHERE type = 'index' AND name NOT LIKE 'sqlite_%'`).all() as any[];

    return rows.map(r => {
      const info = db.prepare(`PRAGMA index_info("${r.name}")`).all() as any[];
      const meta = db.prepare(`PRAGMA index_list("${r.tbl_name}")`).all() as any[];
      const match = meta.find(m => m.name === r.name);

      return {
        name: r.name,
        table: r.tbl_name,
        unique: match ? match.unique === 1 : false,
        columns: info.map(i => i.name)
      };
    });
  }

  public analyzeIndexCoverage(tableName: string): { totalIndexes: number; coveredColumns: string[] } {
    const indexes = this.listIndexes().filter(i => i.table === tableName);
    const covered = Array.from(new Set(indexes.flatMap(i => i.columns)));
    return {
      totalIndexes: indexes.length,
      coveredColumns: covered
    };
  }
}

export const indexingAdvisor = new IndexingAdvisor();
