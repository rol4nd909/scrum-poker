import { Component, inject, signal } from '@angular/core';
import { FirestoreService } from '~services/firestore/firestore.service';
import type { Room as RoomModel } from '~models/room.model';
import { CardSelection } from '~components/card-selection/card-selection';
import { ParticipantService } from '~services/participants/participant.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-room',
  imports: [CardSelection],
  templateUrl: './room.html',
  styleUrls: ['./room.css'],
})
export class Room {
  private firestore = inject(FirestoreService);
  private router = inject(Router);
  private store = inject(ParticipantService);

  readonly room = signal<RoomModel | null>(null);
  readonly participant = this.store.participant;
  readonly roomId = this.store.roomId;

  constructor() {
    const roomId = this.roomId();
    if (!roomId) this.router.navigate(['/']);

    this.firestore.getRoom(roomId!).subscribe((r) => this.room.set(r));
  }

  async selectCard(card: string) {
    const p = this.participant();
    const roomId = this.roomId();
    if (!p || !roomId) return;

    await this.firestore.updateVote(roomId, p, card);
  }

  toggleReveal() {
    const roomId = this.roomId();
    if (!roomId) return;

    return this.firestore.toggleReveal(roomId);
  }

  clearVotes() {
    const roomId = this.roomId();
    if (!roomId) return;

    return this.firestore.resetAllVotes(roomId);
  }

  async clearParticipants() {
    const roomId = this.roomId();
    if (!roomId) return;

    await this.firestore.clearParticipants(roomId);
  }
}
