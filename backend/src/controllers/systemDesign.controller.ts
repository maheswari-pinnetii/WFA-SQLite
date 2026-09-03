import { Request, Response } from 'express';
import { getSystemDesignPatternsOverview, baaSServiceRegistry } from '../patterns/index.js';
import { shardRouter } from '../patterns/sharding.js';
import { defaultBloomFilter } from '../patterns/bloomFilter.js';
import { defaultConsistentHashRing } from '../patterns/consistentHashing.js';
import { sagaOrchestrator } from '../patterns/saga.js';
import { twoPhaseCommitCoordinator } from '../patterns/twoPhaseCommit.js';
import { materializedViewManager } from '../patterns/materializedView.js';
import { writeAheadLogManager } from '../patterns/writeAheadLog.js';

export const getPatternsOverview = (req: Request, res: Response) => {
  try {
    const overview = getSystemDesignPatternsOverview();
    return res.status(200).json({
      success: true,
      data: overview
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getBaaSOverview = (req: Request, res: Response) => {
  try {
    return res.status(200).json({
      success: true,
      data: baaSServiceRegistry.getBaaSServices()
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const executePatternDemo = async (req: Request, res: Response) => {
  const { pattern } = req.params;

  try {
    if (pattern === 'sharding') {
      const shard = shardRouter.getShardForKey('org-stackly-123');
      return res.status(200).json({ success: true, pattern: 'sharding', result: shard });
    }

    if (pattern === 'bloom-filter') {
      defaultBloomFilter.add('usr-emp-01');
      const contains = defaultBloomFilter.mayContain('usr-emp-01');
      const containsNot = defaultBloomFilter.mayContain('non-existent-user');
      return res.status(200).json({ success: true, pattern: 'bloom-filter', result: { contains, containsNot } });
    }

    if (pattern === 'consistent-hashing') {
      const node = defaultConsistentHashRing.getNode('emp-key-999');
      return res.status(200).json({ success: true, pattern: 'consistent-hashing', result: { targetNode: node } });
    }

    if (pattern === 'saga') {
      const sagaRes = await sagaOrchestrator.executeSaga('saga-demo-01', [
        { name: 'Reserve Leave Balance', executeAction: async () => true, compensateAction: async () => true },
        { name: 'Update Attendance Schedule', executeAction: async () => true, compensateAction: async () => true }
      ]);
      return res.status(200).json({ success: true, pattern: 'saga', result: sagaRes });
    }

    if (pattern === 'two-phase-commit') {
      const result = await twoPhaseCommitCoordinator.executeTransaction('tx-demo-01', [
        { id: 'p1', name: 'Database Node Alpha', prepare: async () => true, commit: async () => true, rollback: async () => true },
        { id: 'p2', name: 'Database Node Beta', prepare: async () => true, commit: async () => true, rollback: async () => true }
      ]);
      return res.status(200).json({ success: true, pattern: 'two-phase-commit', result });
    }

    if (pattern === 'materialized-view') {
      const refreshed = materializedViewManager.refreshDashboardSummaryMV();
      return res.status(200).json({ success: true, pattern: 'materialized-view', result: refreshed });
    }

    if (pattern === 'wal') {
      const walInfo = writeAheadLogManager.getWALConfig();
      return res.status(200).json({ success: true, pattern: 'wal', result: walInfo });
    }

    return res.status(200).json({
      success: true,
      pattern,
      message: `Pattern ${pattern} demonstration executed successfully.`
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
