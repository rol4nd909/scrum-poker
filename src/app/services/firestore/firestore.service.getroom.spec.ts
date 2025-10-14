import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Firestore } from '@angular/fire/firestore';
import { FirestoreService } from './firestore.service';
import { FirestoreAdapter } from '~services/adapters/firestore-adapter';

describe('FirestoreService.getRoom', () => {
  let service: FirestoreService;

  const mockAdapter: Partial<FirestoreAdapter> = {
    doc: (path: string) => ({ path }),
    collection: (path: string) => ({ path }),
    docData: (ref: any) => of({ id: 'room-1', revealed: true }),
    collectionData: (ref: any) =>
      of([
        { id: 'p1', name: 'A' },
        { id: 'p2', name: 'B' },
      ]),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Firestore, useValue: {} },
        { provide: FirestoreAdapter, useValue: mockAdapter },
      ],
    });
    service = TestBed.inject(FirestoreService);
  });

  it('combines room doc and participants into a Room object', (done) => {
    const room$ = service.getRoom('room-1');
    room$.subscribe((r) => {
      try {
        expect(r.id).toBe('room-1');
        expect(r.revealed).toBeTrue();
        expect(Array.isArray(r.participants)).toBeTrue();
        expect(r.participants.length).toBe(2);
        expect(r.participants[0].id).toBe('p1');
        done();
      } catch (err) {
        done.fail(err as Error);
      }
    });
  });
});
