import { TestBed } from '@angular/core/testing';

import { ParticipantService } from './participant.service';
import { LocalStorageAdapter } from '~services/adapters/local-storage-adapter';

describe('ParticipantStore', () => {
  let service: ParticipantService;
  const inMemoryStorage: Record<string, string> = {};

  const mockAdapter: Partial<LocalStorageAdapter> = {
    getItem: (k: string) => inMemoryStorage[k] ?? null,
    setItem: (k: string, v: string) => (inMemoryStorage[k] = v),
    removeItem: (k: string) => delete inMemoryStorage[k],
  };

  beforeEach(() => {
    Object.keys(inMemoryStorage).forEach((k) => delete inMemoryStorage[k]);
    TestBed.configureTestingModule({
      providers: [{ provide: LocalStorageAdapter, useValue: mockAdapter }],
    });
    service = TestBed.inject(ParticipantService);
    // Ensure a clean starting state via the service public API
    service.clearParticipant();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('restores state from persisted participant when present', () => {
    const participant = { id: 'p1', name: 'Alice' } as any;
    const roomId = 'main-room';

    // Persist via the public API, then recreate service via DI to simulate a new session
    service.setParticipant(participant, roomId);
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: LocalStorageAdapter, useValue: mockAdapter }],
    });
    const svc = TestBed.inject(ParticipantService);

    expect(svc.participant()).toEqual(participant);
    expect(svc.roomId()).toEqual(roomId);
  });

  it('setParticipant persists and updates signals', () => {
    const participant = { id: 'p2', name: 'Bob' } as any;
    const roomId = 'room-2';

    service.setParticipant(participant, roomId);

    // A new DI-backed instance should restore the same persisted values
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: LocalStorageAdapter, useValue: mockAdapter }],
    });
    const svc = TestBed.inject(ParticipantService);
    expect(svc.participant()).toEqual(participant);
    expect(svc.roomId()).toEqual(roomId);

    // And the current service signals were updated as well
    expect(service.participant()).toEqual(participant);
    expect(service.roomId()).toEqual(roomId);
  });

  it('clearParticipant removes persisted entry and clears signals', () => {
    const participant = { id: 'p3', name: 'Carol' } as any;
    const roomId = 'room-3';
    service.setParticipant(participant, roomId);

    service.clearParticipant();

    // A new DI-backed instance should not restore anything after clear
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: LocalStorageAdapter, useValue: mockAdapter }],
    });
    const svc = TestBed.inject(ParticipantService);
    expect(svc.participant()).toBeNull();
    expect(svc.roomId()).toBeNull();

    expect(service.participant()).toBeNull();
    expect(service.roomId()).toBeNull();
  });
});
