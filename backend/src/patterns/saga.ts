/**
 * Pattern 6: Saga Pattern (Orchestrated Distributed Transactions)
 * Coordinates multi-step operations (e.g., Leave Booking -> Attendance Allocation -> Payroll Credit) with compensating rollback actions.
 */

export interface SagaStep {
  name: string;
  execute: () => Promise<boolean>;
  compensate: () => Promise<boolean>;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'COMPENSATED';
}

export interface SagaResult {
  sagaId: string;
  success: boolean;
  executedSteps: string[];
  compensatedSteps: string[];
  error?: string;
}

export class SagaOrchestrator {
  public async executeSaga(
    sagaId: string,
    steps: { name: string; executeAction: () => Promise<boolean>; compensateAction: () => Promise<boolean> }[]
  ): Promise<SagaResult> {
    const executed: SagaStep[] = [];
    const compensated: string[] = [];

    for (const s of steps) {
      const step: SagaStep = {
        name: s.name,
        execute: s.executeAction,
        compensate: s.compensateAction,
        status: 'PENDING'
      };

      try {
        const ok = await step.execute();
        if (!ok) {
          throw new Error(`Step execution returned false: ${s.name}`);
        }
        step.status = 'COMPLETED';
        executed.push(step);
      } catch (err: any) {
        step.status = 'FAILED';
        // Trigger Compensating Rollback in reverse order
        for (let i = executed.length - 1; i >= 0; i--) {
          const compStep = executed[i];
          try {
            await compStep.compensate();
            compStep.status = 'COMPENSATED';
            compensated.push(compStep.name);
          } catch (compErr) {
            console.error(`Compensating step failed: ${compStep.name}`, compErr);
          }
        }

        return {
          sagaId,
          success: false,
          executedSteps: executed.map(e => e.name),
          compensatedSteps: compensated,
          error: err.message
        };
      }
    }

    return {
      sagaId,
      success: true,
      executedSteps: executed.map(e => e.name),
      compensatedSteps: []
    };
  }
}

export const sagaOrchestrator = new SagaOrchestrator();
