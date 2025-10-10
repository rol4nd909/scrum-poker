import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FirestoreService } from '~services/firestore.service';
import { ParticipantStore } from '~services/participant-store';
import type { Participant } from '~models/participant.model';

@Component({
  selector: 'app-join-room',
  templateUrl: './join-room.html',
  styleUrl: './join-room.css',
})
export class JoinRoom {
  private firestore = inject(FirestoreService);
  private router = inject(Router);
  private store = inject(ParticipantStore);

  readonly name = signal('');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly roomId = 'main-room';

  constructor() {
    const savedParticipant = localStorage.getItem('participant');
    const savedRoomId = localStorage.getItem('roomId');

    if (savedParticipant && savedRoomId) {
      this.store.setParticipant(JSON.parse(savedParticipant), savedRoomId);
      this.router.navigate(['/room']);
    }
  }

  onNameInput(event: Event) {
    this.name.set((event.target as HTMLInputElement).value);
  }

  async joinRoom() {
    const name = this.name();
    if (!name.trim()) return;

    this.loading.set(true);
    try {
      const participant: Participant = { id: crypto.randomUUID(), name };

      await this.firestore.addParticipant(this.roomId, participant);
      this.store.setParticipant(participant, this.roomId);

      this.router.navigate(['/room']);
    } catch (err: any) {
      this.error.set(err.message || 'Failed to join room');
    } finally {
      this.loading.set(false);
    }
  }
}
