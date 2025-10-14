import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ParticipantService } from '~services/participants/participant.service';
import { FirestoreService } from '~services/firestore/firestore.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class Header {
  private firestore = inject(FirestoreService);
  private router = inject(Router);
  private store = inject(ParticipantService);

  readonly participant = this.store.participant;
  readonly roomId = this.store.roomId;

  async leaveRoom() {
    const p = this.participant();
    const roomId = this.roomId();
    if (!p || !roomId) {
      this.store.clearParticipant();
      this.router.navigate(['/']);
      return;
    }

    await this.firestore.removeParticipant(roomId, p);
    this.store.clearParticipant();
    this.router.navigate(['/']);
  }
}
