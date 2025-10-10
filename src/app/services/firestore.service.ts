import { Injectable } from '@angular/core';
import { doc, docData, Firestore, runTransaction, updateDoc } from '@angular/fire/firestore';
import { firstValueFrom, type Observable } from 'rxjs';
import type { Room } from '~models/room.model';
import type { Participant } from '~models/participant.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({ providedIn: 'root' })
export class FirestoreService {
  constructor(private firestore: Firestore) {}

  private getRoomRef(roomId: string) {
    return doc(this.firestore, `rooms/${roomId}`);
  }

  getRoom(roomId: string): Observable<Room> {
    return docData(this.getRoomRef(roomId), { idField: 'id' }) as Observable<Room>;
  }

  async addParticipant(roomId: string, participant: Participant) {
    const roomRef = this.getRoomRef(roomId);

    await runTransaction(this.firestore, async (transaction) => {
      const roomDoc = await transaction.get(roomRef);
      if (!roomDoc.exists()) throw new Error(`Room ${roomId} not found`);

      const data = roomDoc.data() as Room;
      const participants: Participant[] = data.participants || [];

      const exists = participants.some((p) => p.id === participant.id);
      const updated = exists
        ? participants.map((p) => (p.id === participant.id ? participant : p))
        : [...participants, participant];

      transaction.update(roomRef, { participants: updated });
    });
  }

  async removeParticipant(roomId: string, participant: Participant) {
    const roomRef = this.getRoomRef(roomId);

    await runTransaction(this.firestore, async (transaction) => {
      const roomDoc = await transaction.get(roomRef);
      if (!roomDoc.exists()) return;

      const data = roomDoc.data() as Room;
      const participants: Participant[] = data.participants || [];

      const updated = participants.filter((p) => p.id !== participant.id);

      transaction.update(roomRef, { participants: updated });
    });
  }

  clearParticipants(roomId: string) {
    return updateDoc(this.getRoomRef(roomId), { participants: [], revealed: false });
  }

  async updateVote(roomId: string, participant: Participant, vote: string | null) {
    const roomRef = this.getRoomRef(roomId);

    await runTransaction(this.firestore, async (transaction) => {
      const roomDoc = await transaction.get(roomRef);
      if (!roomDoc.exists()) throw new Error(`Room ${roomId} not found`);

      const data = roomDoc.data() as Room;
      const participants: Participant[] = data.participants || [];

      const exists = participants.some((p) => p.id === participant.id);

      let updatedParticipants: Participant[];

      if (exists) {
        // Update the vote
        updatedParticipants = participants.map((p) =>
          p.id === participant.id ? { ...p, vote } : p
        );
      } else {
        // Re-add participant with same ID and vote
        updatedParticipants = [...participants, { ...participant, vote }];
      }

      transaction.update(roomRef, { participants: updatedParticipants });
    });
  }

  resetAllVotes(roomId: string) {
    return runTransaction(this.firestore, async (transaction) => {
      const roomRef = this.getRoomRef(roomId);
      const roomDoc = await transaction.get(roomRef);
      if (!roomDoc.exists()) return;

      const data = roomDoc.data() as Room;
      const reset = data.participants.map((p) => ({ ...p, vote: null }));

      transaction.update(roomRef, { participants: reset, revealed: false });
    });
  }

  toggleReveal(roomId: string) {
    return runTransaction(this.firestore, async (transaction) => {
      const roomRef = this.getRoomRef(roomId);
      const roomDoc = await transaction.get(roomRef);
      if (!roomDoc.exists()) return;

      const data = roomDoc.data() as Room;
      transaction.update(roomRef, { revealed: !data.revealed });
    });
  }
}
