import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FirestoreService } from '~services/firestore.service';
import type { Participant } from '~models/participant.model';

@Component({
  selector: 'app-join-room',
  imports: [],
  templateUrl: './join-room.html',
  styleUrl: './join-room.css',
})
export class JoinRoom {
  firestore = inject(FirestoreService);
  router = inject(Router);

  readonly loading = signal(false);
  readonly name = signal('');
  readonly error = signal<string | null>(null);

  readonly roomId = 'main-room';
  readonly localStorageKey = 'participant';

  constructor() {
    // Check if the user is already a participant
    const savedParticipant = localStorage.getItem(this.localStorageKey);

    if (savedParticipant) {
      this.router.navigate(['/room']);
    }
  }

  onNameInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.name.set(input.value);
  }

  async joinRoom() {
    const name = this.name();
    if (!name.trim()) return;

    // Check if we already have a participant ID stored
    let participant = localStorage.getItem('participant');
    let parsed: Participant | null = participant ? JSON.parse(participant) : null;

    // Always generate a new one if we don’t have one stored
    if (!parsed) {
      parsed = { id: crypto.randomUUID(), name };
    }

    // 🔥 Add (or re-add) participant to Firestore
    await this.firestore.addParticipant('main-room', parsed);

    // Save locally
    localStorage.setItem('participant', JSON.stringify(parsed));

    // Navigate to room
    this.router.navigate(['/room']);
  }
}
