import { Injectable, signal, inject } from '@angular/core';
import type { Participant } from '~models/participant.model';
import { LocalStorageAdapter } from '~services/adapters/local-storage-adapter';

@Injectable({ providedIn: 'root' })
export class ParticipantService {
  /**
   * Signal holding the current participant (or null when not set).
   * Use `participant()` to read the current value and `setParticipant` to update it.
   */
  readonly participant = signal<Participant | null>(null);
  /**
   * Signal holding the currently-restored roomId for the participant.
   */
  readonly roomId = signal<string | null>(null);

  private readonly STORAGE_KEY = 'bld-scrum-poker';
  private readonly storage = inject(LocalStorageAdapter);

  /**
   * Restore a single canonical participant record from localStorage.
   * The store persists exactly one entry under `STORAGE_KEY` with shape
   * { participant, roomId }.
   *
   * Failure modes: if the stored JSON is malformed or missing the expected
   * fields, the entry is removed to avoid later parsing errors.
   */
  constructor() {
    try {
      const raw = this.storage.getItem(this.STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { participant: Participant; roomId: string } | null;
      if (parsed?.participant && parsed?.roomId) {
        this.participant.set(parsed.participant);
        this.roomId.set(parsed.roomId);
      } else {
        this.storage.removeItem(this.STORAGE_KEY);
      }
    } catch {
      this.storage.removeItem(this.STORAGE_KEY);
    }
  }

  /**
   * Persist participant and roomId to signals and localStorage.
   * This is the single source of truth for client-side auto-restore.
   */
  setParticipant(participant: Participant, roomId: string) {
    this.participant.set(participant);
    this.roomId.set(roomId);
    this.storage.setItem(this.STORAGE_KEY, JSON.stringify({ participant, roomId }));
  }

  /**
   * Clear the in-memory and persisted participant state.
   */
  clearParticipant() {
    this.participant.set(null);
    this.roomId.set(null);
    this.storage.removeItem(this.STORAGE_KEY);
  }
}
