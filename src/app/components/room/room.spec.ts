import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { Room } from './room';
import { FirestoreService } from '~services/firestore/firestore.service';

describe('Room', () => {
  let component: Room;
  let fixture: ComponentFixture<Room>;

  beforeEach(async () => {
    const firestoreStub = {
      getRoom: (id: string) => of({ id: id || 'main-room', participants: [], revealed: false }),
    } as Partial<FirestoreService>;

    await TestBed.configureTestingModule({
      imports: [Room],
      providers: [{ provide: FirestoreService, useValue: firestoreStub }, provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Room);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
