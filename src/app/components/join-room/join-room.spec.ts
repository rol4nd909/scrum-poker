import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Firestore } from '@angular/fire/firestore';

import { JoinRoom } from './join-room';

describe('JoinRoom', () => {
  let component: JoinRoom;
  let fixture: ComponentFixture<JoinRoom>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JoinRoom],
      providers: [{ provide: Firestore, useValue: {} }, provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(JoinRoom);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
