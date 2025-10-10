import { Component, inject } from '@angular/core';
import { FirestoreService } from '~app/services/firestore.service';
import type { Room as RoomModel } from '~models/room.model';
import { CardSelection } from '../card-selection/card-selection';
import type { Participant } from '~app/models/participant.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-room',
  imports: [CardSelection],
  templateUrl: './room.html',
  styleUrl: './room.css',
})
export class Room {
  firestore = inject(FirestoreService);
  router = inject(Router);

  room: RoomModel | null | undefined;
  participant: Participant | null | undefined;

  constructor() {
    const savedParticipant = localStorage.getItem('participant');

    if (!savedParticipant) {
      this.router.navigate(['/']);
      return;
    }

    this.participant = JSON.parse(savedParticipant);

    // 🔥 Subscribe to the room’s realtime updates
    this.firestore.getRoom('main-room').subscribe((room) => {
      this.room = room;
    });
  }

  /** Set the participant’s vote in Firestore */
  async selectCard(card: string) {
    const participantStr = localStorage.getItem('participant');
    if (!participantStr) {
      this.router.navigate(['/']);
      return;
    }

    const participant = JSON.parse(participantStr);
    await this.firestore.updateVote('main-room', participant, card);
  }

  /** Show/Hide all votes */
  toggleReveal() {
    return this.firestore.toggleReveal('main-room');
  }

  /** Reset all votes */
  clearVotes() {
    return this.firestore.resetAllVotes('main-room');
  }

  /** Remove all participants */
  async clearParticipants() {
    await this.firestore.clearParticipants('main-room');
  }
}
