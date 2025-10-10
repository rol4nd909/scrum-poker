import { Injectable } from '@angular/core';
import { arrayUnion, doc, docData, Firestore, updateDoc } from '@angular/fire/firestore';
import { firstValueFrom, type Observable } from 'rxjs';
import type { Room } from '~models/room.model';
import type { Participant } from '~models/participant.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  constructor(private firestore: Firestore) {}

  /** 🔹 Helper: get document reference */
  private getRoomRef(roomId: string) {
    return doc(this.firestore, `rooms/${roomId}`);
  }

  /** 🔹 Helper: get snapshot as Room */
  private async getRoomSnapshot(roomId: string): Promise<Room | null> {
    const snap = await firstValueFrom(docData(this.getRoomRef(roomId)));
    return snap ? (snap as Room) : null;
  }

  /** 🔹 Helper: run a callback with a room */
  private async withRoom(roomId: string, fn: (room: Room) => Promise<void> | void): Promise<void> {
    const room = await this.getRoomSnapshot(roomId);
    if (!room) return;
    await fn(room);
  }

  /** Get a single room (realtime) */
  getRoom(roomId: string): Observable<Room> {
    return docData(this.getRoomRef(roomId), { idField: 'id' }) as Observable<Room>;
  }

  /** Add or re-add participant */
  async addParticipant(roomId: string, participant: Participant | Omit<Participant, 'id'>) {
    const newParticipant: Participant = {
      id: 'id' in participant ? participant.id : uuidv4(),
      name: participant.name,
      vote: participant.vote ?? null,
    };

    await updateDoc(this.getRoomRef(roomId), {
      participants: arrayUnion(newParticipant),
    });
  }

  /** Remove all participants from a room */
  clearParticipants(roomId: string) {
    return updateDoc(this.getRoomRef(roomId), { participants: [], revealed: false });
  }

  /** Update participant’s vote, or re-add if missing */
  async updateVote(roomId: string, participant: Participant, vote: string | null) {
    const room = await this.getRoomSnapshot(roomId);
    if (!room) return;

    const exists = room.participants.some((p) => p.id === participant.id);

    if (!exists) {
      // Re-add with same name but new id (fresh join after reset)
      const rejoin: Participant = { ...participant, id: uuidv4(), vote };
      await this.addParticipant(roomId, rejoin);
      localStorage.setItem('participant', JSON.stringify(rejoin));
      return;
    }

    const updated = room.participants.map((p) => (p.id === participant.id ? { ...p, vote } : p));

    await updateDoc(this.getRoomRef(roomId), { participants: updated });
  }

  /** Reset all votes (and hide votes) */
  resetAllVotes(roomId: string) {
    return this.withRoom(roomId, async (room) => {
      const resetParticipants = room.participants.map((p) => ({ ...p, vote: null }));
      await updateDoc(this.getRoomRef(roomId), {
        participants: resetParticipants,
        revealed: false,
      });
    });
  }

  /** Toggle revealed state */
  toggleReveal(roomId: string) {
    return this.withRoom(roomId, async (room) => {
      await updateDoc(this.getRoomRef(roomId), { revealed: !room.revealed });
    });
  }
}
