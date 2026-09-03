/**
 * Pattern 4: Event Sourcing Engine
 * Stores state changes as an immutable sequence of events and reconstructs aggregate state by replaying events.
 */

export interface EventRecord {
  id: string;
  aggregateId: string;
  eventType: string;
  data: any;
  timestamp: string;
  sequenceNumber: number;
}

export interface AttendanceAggregateState {
  employeeId: string;
  isCheckedIn: boolean;
  totalWorkMinutes: number;
  lastCheckInAt?: string;
  lastCheckOutAt?: string;
  eventCount: number;
}

export class EventSourcingEngine {
  private eventStore: EventRecord[] = [];

  public appendEvent(aggregateId: string, eventType: string, data: any): EventRecord {
    const event: EventRecord = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      aggregateId,
      eventType,
      data,
      timestamp: new Date().toISOString(),
      sequenceNumber: this.eventStore.filter(e => e.aggregateId === aggregateId).length + 1
    };
    this.eventStore.push(event);
    return event;
  }

  public getEvents(aggregateId: string): EventRecord[] {
    return this.eventStore.filter(e => e.aggregateId === aggregateId);
  }

  /**
   * Reconstructs state from event stream.
   */
  public rebuildState(aggregateId: string): AttendanceAggregateState {
    const events = this.getEvents(aggregateId);
    let state: AttendanceAggregateState = {
      employeeId: aggregateId,
      isCheckedIn: false,
      totalWorkMinutes: 0,
      eventCount: events.length
    };

    for (const evt of events) {
      if (evt.eventType === 'CHECK_IN') {
        state.isCheckedIn = true;
        state.lastCheckInAt = evt.timestamp;
      } else if (evt.eventType === 'CHECK_OUT') {
        state.isCheckedIn = false;
        state.lastCheckOutAt = evt.timestamp;
        if (evt.data?.durationMinutes) {
          state.totalWorkMinutes += evt.data.durationMinutes;
        }
      }
    }

    return state;
  }
}

export const eventSourcingEngine = new EventSourcingEngine();
