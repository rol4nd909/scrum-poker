import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Firestore } from '@angular/fire/firestore';
import { FirestoreService } from './firestore.service';
import { FirestoreAdapter } from '~services/adapters/firestore-adapter';

/**
 * A lightweight mock-controller that allows tests to configure
 * how module-level Firestore helpers behave. This avoids spying
 * on non-writable module exports and provides predictable behaviour.
 */
type MockController = {
  roomData?: any;
  participants?: any[];
  roomExists?: boolean;
  participantExists?: boolean;
  participantDocs?: any[];
  lastBatch?: any;
  spies: Record<string, jasmine.Spy>;
};

describe('FirestoreService (unit)', () => {
  let service: FirestoreService;
  let mock: MockController;
  let mockAdapter: Partial<FirestoreAdapter>;

  beforeEach(() => {
    mock = {
      roomData: { id: 'r1', revealed: false },
      participants: [],
      roomExists: true,
      participantExists: false,
      participantDocs: [],
      spies: {} as any,
    };

    // Build a partial mock adapter that uses the mock controller for behavior.
    mockAdapter = {
      doc: (path: string) => ({ path } as any),
      docData: () => of(mock.roomData) as any,
      collection: (path: string) => ({ path } as any as any),
      collectionData: () => of(mock.participants || []) as any,
      runTransaction: async <T>(updater: (tx: any) => Promise<T>) => {
        const spies: any = {
          set: jasmine.createSpy('tx.set'),
          update: jasmine.createSpy('tx.update'),
          delete: jasmine.createSpy('tx.delete'),
        };
        const tx = {
          get: async (ref: any) => {
            if (ref && typeof ref.path === 'string' && ref.path.includes('/participants/'))
              return { exists: () => !!mock.participantExists } as any;
            return { exists: () => !!mock.roomExists, data: () => mock.roomData } as any;
          },
          set: spies.set,
          update: spies.update,
          delete: spies.delete,
        } as any;
        mock.spies = spies;
        const result = await updater(tx);
        return result as T;
      },
      updateDoc: () => Promise.resolve() as any,
      getDocs: () =>
        Promise.resolve({ forEach: (cb: any) => (mock.participantDocs || []).forEach(cb) }) as any,
      writeBatch: () => {
        const b = {
          delete: jasmine.createSpy('batch.delete'),
          update: jasmine.createSpy('batch.update'),
          commit: jasmine.createSpy('batch.commit').and.returnValue(Promise.resolve()),
        } as any;
        mock.lastBatch = b;
        return b as any;
      },
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: Firestore, useValue: {} },
        { provide: FirestoreAdapter, useValue: mockAdapter as FirestoreAdapter },
      ],
    });
    service = TestBed.inject(FirestoreService);
  });

  // getRoom uses module-level `docData`/`collectionData` which are bundled as
  // non-configurable functions in the test runtime. Testing `getRoom` with
  // unit tests requires either (a) moving the data access behind an
  // injectable adapter or (b) using the Firestore emulator. We'll cover
  // integration tests later. Below we focus on behavior we can unit-test.

  it('addParticipant throws if room missing (transaction)', async () => {
    const participant = { id: 'p1', name: 'A' } as any;
    mock.roomExists = false;

    await expectAsync(service.addParticipant('r1', participant)).toBeRejected();
  });

  it('updateVote sets vote when participant missing', async () => {
    const participant = { id: 'p2', name: 'B' } as any;
    mock.roomExists = true;
    mock.participantExists = false;

    await expectAsync(service.updateVote('r1', participant, '5')).toBeResolved();
    // when participant didn't exist, tx.set should have been called
    expect(mock.spies['set']).toHaveBeenCalled();
  });

  it('removeParticipant deletes participant when room exists', async () => {
    const participant = { id: 'p3', name: 'C' } as any;
    mock.roomExists = true;
    mock.participantExists = true;

    await service.removeParticipant('r1', participant);
    expect(mock.spies['delete']).toHaveBeenCalled();
  });

  it('clearParticipants uses batch delete and updates room', async () => {
    mock.participantDocs = [{ ref: 'd1' } as any];

    await service.clearParticipants('r1');

    expect(mock.lastBatch.delete).toHaveBeenCalled();
    expect(mock.lastBatch.commit).toHaveBeenCalled();
  });

  it('resetAllVotes batches updates and updates room', async () => {
    mock.participantDocs = [{ ref: 'd1' } as any];

    await service.resetAllVotes('r1');

    expect(mock.lastBatch.update).toHaveBeenCalled();
    expect(mock.lastBatch.commit).toHaveBeenCalled();
  });

  it('toggleReveal flips revealed flag in a transaction', async () => {
    mock.roomExists = true;
    mock.roomData = { id: 'r1', revealed: false };

    await service.toggleReveal('r1');
    expect(mock.spies['update']).toHaveBeenCalled();
  });
});
