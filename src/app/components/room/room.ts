import { Component, inject, signal, computed, ViewChild, type ElementRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import type { SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import type { Room as RoomModel } from '~models/room.model';
import { FirestoreService } from '~services/firestore/firestore.service';
import { ParticipantService } from '~services/participants/participant.service';
import { getCardSvgString } from '~components/card-selection/cards.data';
import { CardSelection } from '~components/card-selection/card-selection';
import { Header } from '~components/header/header';

@Component({
  selector: 'app-room',
  imports: [CardSelection, Header],
  templateUrl: './room.html',
  styleUrls: ['./room.css'],
})
export class Room {
  private firestore = inject(FirestoreService);
  private router = inject(Router);
  private store = inject(ParticipantService);
  private sanitizer = inject(DomSanitizer);

  @ViewChild('clearParticipantsDialog') clearParticipantsDialog?: ElementRef<HTMLDialogElement>;
  @ViewChild('deleteEstimatesDialog') deleteEstimatesDialog?: ElementRef<HTMLDialogElement>;

  readonly room = signal<RoomModel | null>(null);
  // Track the last reset timestamp we've observed so we only clear local
  // participant state when a new reset event arrives.
  private lastSeenResetAt: number | null = null;

  readonly participant = this.store.participant;
  readonly roomId = this.store.roomId;

  /**
   * Derived list of participants. When the room is revealed we return a copy
   * of the participants array sorted from highest to lowest vote. When not
   * revealed we preserve the original order.
   */
  readonly sortedParticipants = computed(() => {
    const r = this.room();
    if (!r || !r.participants) return [] as RoomModel['participants'];

    const arr = [...r.participants];
    if (!r.revealed) return arr;

    // helper to interpret vote value
    const val = (v: any) => {
      if (v === null || v === undefined) return { isNum: false, num: -Infinity, str: '' };
      const n = parseFloat(String(v));
      if (!Number.isFinite(n)) return { isNum: false, num: -Infinity, str: String(v) };
      return { isNum: true, num: n, str: '' };
    };

    arr.sort((a, b) => {
      const va = val(a.vote);
      const vb = val(b.vote);

      // both numeric -> descending numeric
      if (va.isNum && vb.isNum) return vb.num - va.num;
      // numeric comes before non-numeric
      if (va.isNum) return -1;
      if (vb.isNum) return 1;
      // both non-numeric: put empty/null last, otherwise compare lexicographically desc
      if (!va.str && vb.str) return 1; // a is empty -> after b
      if (va.str && !vb.str) return -1;
      return String(vb.str).localeCompare(String(va.str));
    });

    return arr;
  });

  constructor() {
    const roomId = this.roomId();
    if (!roomId) this.router.navigate(['/']);

    this.firestore.getRoom(roomId!).subscribe((r) => {
      // When the backend signals a vote reset (lastResetAt) we should
      // clear the locally persisted participant vote for all clients.
      // Only act when the timestamp advances to avoid repeated clears.
      if (r && (r as any).lastResetAt) {
        const ts = (r as any).lastResetAt as number;
        if (ts && ts !== this.lastSeenResetAt) {
          this.lastSeenResetAt = ts;
          // clear the locally stored vote for this client (if present)
          const rid = roomId!;
          try {
            this.updateLocalParticipantVote(rid, null);
          } catch {}
        }
      }

      this.room.set(r);
    });
  }

  /**
   * Helper: persist a cleared vote locally (participant.vote = null)
   * Swallows storage errors to avoid crashing the user flow.
   */
  private updateLocalParticipantVote(roomId: string, card: string | null = null) {
    const p = this.participant();

    if (!p) return;

    try {
      const updated = { ...p, vote: card };
      this.store.setParticipant(updated, roomId);
    } catch {
      // ignore local persistence errors
    }
  }

  /** Close a dialog ElementRef safely (no-ops if missing) */
  private closeDialogRef(dialog?: ElementRef<HTMLDialogElement>) {
    try {
      dialog?.nativeElement.close();
    } catch {
      // ignore
    }
  }

  async selectCard(card: string) {
    const p = this.participant();
    const roomId = this.roomId();

    if (!p || !roomId) return;

    await this.firestore.updateVote(roomId, p, card);

    this.updateLocalParticipantVote(roomId, card);
  }

  toggleReveal() {
    const roomId = this.roomId();
    if (!roomId) return;

    return this.firestore.toggleReveal(roomId);
  }

  async clearVotes() {
    const roomId = this.roomId();
    if (!roomId) return;

    await this.firestore.resetAllVotes(roomId);

    // Clear local participant vote and close the delete-estimates dialog
    // using the centralized helpers to avoid duplication.
    this.updateLocalParticipantVote(roomId);
    this.closeDialogRef(this.deleteEstimatesDialog);
  }

  async clearParticipants() {
    const roomId = this.roomId();
    if (!roomId) return;

    await this.firestore.clearParticipants(roomId);

    // Close dialog and clear local participant vote using helpers.
    this.closeDialogRef(this.clearParticipantsDialog);
    this.updateLocalParticipantVote(roomId);
  }

  voteSvg(vote?: string | null): SafeHtml | null {
    if (!vote) return null;
    const raw = getCardSvgString(vote);
    if (!raw) return null;
    return this.sanitizer.bypassSecurityTrustHtml(raw);
  }
}
