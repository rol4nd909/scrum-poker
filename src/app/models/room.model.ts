import type { Participant } from './participant.model';

export interface Room {
  id: string;
  participants: Participant[];
  revealed: boolean;
  /**
   * Monotonic timestamp (ms since epoch) updated when votes are reset.
   * Clients observe this field to clear their local persisted vote.
   */
  lastResetAt?: number | null;
}
