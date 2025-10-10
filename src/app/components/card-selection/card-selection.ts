import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-card-selection',
  imports: [],
  templateUrl: './card-selection.html',
  styleUrl: './card-selection.css',
})
export class CardSelection {
  @Output() cardSelected = new EventEmitter<string>();

  cards = ['0', '1', '2', '3', '5', '8', '13', '21', '?', '☕'];

  selectCard(card: string) {
    this.cardSelected.emit(card);
  }
}
