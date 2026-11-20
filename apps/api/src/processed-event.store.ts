export interface ProcessedEventStore {
  /** Returns true if this call claimed the event, false if it was already claimed. */
  tryClaim(eventId: string): Promise<boolean>;
  /** Gives the claim back, so a retry can process the event again. */
  release(eventId: string): Promise<void>;
}

export const PROCESSED_EVENT_STORE = Symbol('PROCESSED_EVENT_STORE');