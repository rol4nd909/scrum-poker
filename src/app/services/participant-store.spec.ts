import { TestBed } from '@angular/core/testing';

import { ParticipantStore } from './participant-store';

describe('ParticipantStore', () => {
  let service: ParticipantStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ParticipantStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
