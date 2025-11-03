import { Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import type { SafeHtml } from '@angular/platform-browser';
import { CARDS } from './cards.data';
import type { Card } from './cards.data';

@Component({
  selector: 'app-card-selection',
  imports: [],
  templateUrl: './card-selection.html',
  styleUrls: ['./card-selection.css'],
})
export class CardSelection {
  /** callback provided by the parent to receive selected card */
  @Input() onSelect: (card: string) => void = () => {};
  /** currently selected card id (passed from parent) */
  @Input() selected: string | null = null;

  cards: Card[] = CARDS;

  /** type guard for template helpers */
  isSvgCard(card: Card): card is { id: string; svg: string } {
    return typeof card !== 'string';
  }

  /** return the id/value to send to parent on selection */
  cardId(card: Card): string {
    return this.isSvgCard(card) ? card.id : card;
  }

  constructor(private sanitizer: DomSanitizer) {}

  /** return svg markup (if any) for rendering (SafeHtml) */
  cardSvg(card: Card): SafeHtml | null {
    if (!this.isSvgCard(card)) return null;
    // SVGs are hard-coded in this component; mark them as trusted HTML so
    // they render correctly via [innerHTML]. Avoid bypassing security for
    // untrusted user input.
    return this.sanitizer.bypassSecurityTrustHtml(card.svg);
  }

  selectCard(card: string) {
    // optimistically mark as selected for immediate UI feedback
    this.selected = card;
    this.onSelect(card);
  }
}
