import { TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';
import { FirestoreService } from './firestore.service';
import { FirestoreAdapter } from '~services/adapters/firestore-adapter';

class MockAdapter {
  doc(_: string) {
    return { path: _ } as any;
  }
  docData() {
    return {} as any;
  }
  collection() {
    return {} as any;
  }
  collectionData() {
    return {} as any;
  }
  runTransaction() {
    return Promise.resolve();
  }
  updateDoc() {
    return Promise.resolve();
  }
  getDocs() {
    return Promise.resolve({ forEach: (_: any) => {} } as any);
  }
  writeBatch() {
    return { delete: () => {}, update: () => {}, commit: () => Promise.resolve() } as any;
  }
}

describe('FirestoreService', () => {
  let service: FirestoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Firestore, useValue: {} },
        { provide: FirestoreAdapter, useClass: MockAdapter },
      ],
    });
    service = TestBed.inject(FirestoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
