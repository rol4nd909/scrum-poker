import { Injectable, signal } from '@angular/core';
import type { Participant } from '~models/participant.model';

@Injectable({ providedIn: 'root' })
export class ParticipantStore {
  readonly participant = signal<Participant | null>(null);
  readonly roomId = signal<string | null>(null);

  constructor() {
    const savedParticipant = localStorage.getItem('participant');
    const savedRoomId = localStorage.getItem('roomId');

    if (savedParticipant && savedRoomId) {
      this.participant.set(JSON.parse(savedParticipant));
      this.roomId.set(savedRoomId);
    }
  }

  setParticipant(participant: Participant, roomId: string) {
    this.participant.set(participant);
    this.roomId.set(roomId);
    localStorage.setItem('participant', JSON.stringify(participant));
    localStorage.setItem('roomId', roomId);
  }

  clearParticipant() {
    this.participant.set(null);
    this.roomId.set(null);
    localStorage.removeItem('participant');
    localStorage.removeItem('roomId');
  }
}
