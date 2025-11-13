import { Injectable } from '@angular/core';
import { combineLatest, type Observable, map } from 'rxjs';
import { FirestoreAdapter } from '~services/adapters/firestore-adapter';
import type { Room } from '~models/room.model';
import type { Participant } from '~models/participant.model';

@Injectable({ providedIn: 'root' })
export class FirestoreService {
  constructor(private adapter: FirestoreAdapter) {}

  private getRoomRef(roomId: string) {
    return this.adapter.doc(`rooms/${roomId}`);
  }
  /**
   * Returns an observable that merges the room document and the participants
   * subcollection into a single Room object.
   *
   * Contract:
   * - Input: roomId - the Firestore document id for the room.
   * - Output: Observable<Room> that emits an object with shape { id, revealed, participants }.
   * - Error modes: downstream subscribers may get an error if the underlying
   *   Firestore observables error; this method does not throw synchronously.
   *
   * Notes:
   * - This reads the room document via `docData` and the participants via
   *   `collectionData`, then combines them with `combineLatest` so subscribers
   *   always see a consistent view (both room metadata and participant list).
   * - Participants are returned as an array of `Participant` objects.
   */
  getRoom(roomId: string): Observable<Room> {
    const roomRef = this.getRoomRef(roomId);
    const participantsRef = this.adapter.collection(`rooms/${roomId}/participants`);

    const room$ = this.adapter.docData(roomRef, { idField: 'id' }) as Observable<Partial<Room>>;
    const participants$ = this.adapter.collectionData(participantsRef, {
      idField: 'id',
    }) as Observable<Participant[]>;

    return combineLatest([room$, participants$]).pipe(
      map(
        ([roomData, participants]) =>
          ({
            id: roomData.id as string,
            revealed: !!roomData.revealed,
            lastResetAt: (roomData as Partial<Room>).lastResetAt ?? null,
            participants: participants || [],
          } as Room)
      )
    );
  }

  /**
   * Add or update a participant document in the participants subcollection.
   */
  async addParticipant(roomId: string, participant: Participant) {
    const roomRef = this.getRoomRef(roomId);
    const participantRef = this.adapter.doc(`rooms/${roomId}/participants/${participant.id}`);

    await this.adapter.runTransaction(async (transaction) => {
      // Read room atomically to ensure it exists before adding a participant.
      const roomDoc = await transaction.get(roomRef);
      if (!roomDoc.exists()) throw new Error(`Room ${roomId} not found`);

      // Create or overwrite the participant document inside the transaction.
      transaction.set(participantRef, participant);
    });
  }

  /**
   * Remove a participant document from the participants subcollection.
   */
  async removeParticipant(roomId: string, participant: Participant) {
    const roomRef = this.getRoomRef(roomId);
    const participantRef = this.adapter.doc(`rooms/${roomId}/participants/${participant.id}`);

    await this.adapter.runTransaction(async (transaction) => {
      // Only delete if the room still exists — prevents accidental deletes
      // if the room was removed concurrently.
      const roomDoc = await transaction.get(roomRef);
      if (!roomDoc.exists()) return;

      transaction.delete(participantRef);
    });
  }

  /**
   * Delete all participant documents in the participants subcollection and reset room.revealed.
   */
  async clearParticipants(roomId: string) {
    const participantsRef = this.adapter.collection(`rooms/${roomId}/participants`);
    const roomRef = this.getRoomRef(roomId);

    // Use a batched delete to remove all participant documents.
    const snapshot = await this.adapter.getDocs(participantsRef);
    const batch = this.adapter.writeBatch();
    snapshot.forEach((d: { ref: any }) => batch.delete(d.ref));
    await batch.commit();

    // After clearing participants, reset the room 'revealed' flag.
    return this.adapter.updateDoc(roomRef, { revealed: false });
  }

  async updateVote(roomId: string, participant: Participant, vote: string | null) {
    const roomRef = this.getRoomRef(roomId);
    const participantRef = this.adapter.doc(`rooms/${roomId}/participants/${participant.id}`);

    await this.adapter.runTransaction(async (transaction) => {
      // Ensure the room exists before changing votes.
      const roomDoc = await transaction.get(roomRef);
      if (!roomDoc.exists()) throw new Error(`Room ${roomId} not found`);

      // If the participant doc exists, update only the vote field. Otherwise
      // create the participant document with the provided vote.
      const pDoc = await transaction.get(participantRef);
      if (pDoc.exists()) {
        transaction.update(participantRef, { vote });
      } else {
        transaction.set(participantRef, { ...participant, vote });
      }
    });
  }

  /**
   * Reset all participant votes to null and set room.revealed = false.
   */
  async resetAllVotes(roomId: string) {
    const participantsRef = this.adapter.collection(`rooms/${roomId}/participants`);
    const roomRef = this.getRoomRef(roomId);

    // Reset votes via a batch update for atomicity and efficiency.
    const snapshot = await this.adapter.getDocs(participantsRef);
    const batch = this.adapter.writeBatch();
    snapshot.forEach((d: { ref: any }) => batch.update(d.ref, { vote: null }));
    await batch.commit();

    // Also reset the revealed flag on the room document.
    // Also write a timestamp so clients can react (clear local storage).
    return this.adapter.updateDoc(roomRef, { revealed: false, lastResetAt: Date.now() });
  }

  toggleReveal(roomId: string) {
    // Atomically flip the `revealed` boolean on the room document.
    return this.adapter.runTransaction(async (transaction) => {
      const roomRef = this.getRoomRef(roomId);
      const roomDoc = await transaction.get(roomRef);
      if (!roomDoc.exists()) return;

      const data = roomDoc.data() as Room;
      transaction.update(roomRef, { revealed: !data.revealed });
    });
  }
}
