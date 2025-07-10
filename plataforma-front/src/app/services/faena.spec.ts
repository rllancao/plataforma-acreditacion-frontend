import { TestBed } from '@angular/core/testing';

import { Faena } from './faena';

describe('Faena', () => {
  let service: Faena;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Faena);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
