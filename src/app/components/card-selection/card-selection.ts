import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card-selection',
  imports: [],
  templateUrl: './card-selection.html',
  styleUrls: ['./card-selection.css'],
})
export class CardSelection {
  /** callback provided by the parent to receive selected card */
  @Input() onSelect: (card: string) => void = () => {};

  cards = ['?', '☕', '0', '0.5', '1', '2', '3', '5', '8', '13', '20', '40', '100'];

  selectCard(card: string) {
    this.onSelect(card);
  }
}
