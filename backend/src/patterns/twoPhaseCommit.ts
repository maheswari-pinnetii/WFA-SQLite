/**
 * Pattern 18: Two-Phase Commit (2PC) Coordinator
 * Guarantees atomic transaction execution across multiple distributed resource managers via Prepare and Commit/Abort phases.
 */

export interface TransactionParticipant {
  id: string;
  name: string;
  prepare: () => Promise<boolean>;
  commit: () => Promise<boolean>;
  rollback: () => Promise<boolean>;
}

export interface TwoPhaseCommitResult {
  transactionId: string;
  state: 'COMMITTED' | 'ABORTED';
  preparePhasePassed: boolean;
  commitPhasePassed: boolean;
  logs: string[];
}

export class TwoPhaseCommitCoordinator {
  public async executeTransaction(
    txId: string,
    participants: TransactionParticipant[]
  ): Promise<TwoPhaseCommitResult> {
    const logs: string[] = [`[2PC] Starting Transaction ${txId}`];

    // Phase 1: Prepare Phase
    logs.push(`[2PC Phase 1] Voting / Prepare Phase...`);
    let prepareAllOk = true;

    for (const p of participants) {
      try {
        const vote = await p.prepare();
        if (vote) {
          logs.push(`[2PC Phase 1] Participant ${p.name} VOTED_COMMIT`);
        } else {
          prepareAllOk = false;
          logs.push(`[2PC Phase 1] Participant ${p.name} VOTED_ABORT`);
        }
      } catch (err: any) {
        prepareAllOk = false;
        logs.push(`[2PC Phase 1] Participant ${p.name} PREPARE_ERROR: ${err.message}`);
      }
    }

    // Phase 2: Decision Phase (Global Commit or Global Abort)
    if (prepareAllOk) {
      logs.push(`[2PC Phase 2] All participants VOTED_COMMIT. Sending GLOBAL_COMMIT...`);
      for (const p of participants) {
        await p.commit();
        logs.push(`[2PC Phase 2] Participant ${p.name} COMMITTED`);
      }
      return {
        transactionId: txId,
        state: 'COMMITTED',
        preparePhasePassed: true,
        commitPhasePassed: true,
        logs
      };
    } else {
      logs.push(`[2PC Phase 2] One or more participants failed PREPARE. Sending GLOBAL_ABORT...`);
      for (const p of participants) {
        await p.rollback();
        logs.push(`[2PC Phase 2] Participant ${p.name} ROLLED_BACK`);
      }
      return {
        transactionId: txId,
        state: 'ABORTED',
        preparePhasePassed: false,
        commitPhasePassed: false,
        logs
      };
    }
  }
}

export const twoPhaseCommitCoordinator = new TwoPhaseCommitCoordinator();
