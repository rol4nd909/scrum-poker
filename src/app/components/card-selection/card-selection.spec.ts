import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';

import { CardSelection } from './card-selection';

describe('CardSelection', () => {
  let component: CardSelection;
  let fixture: ComponentFixture<CardSelection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardSelection],
      providers: [{ provide: Firestore, useValue: {} }],
    }).compileComponents();

    fixture = TestBed.createComponent(CardSelection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
