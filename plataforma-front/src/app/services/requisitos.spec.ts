import { TestBed } from '@angular/core/testing';

import { Requisitos } from './requisitos';

describe('Requisitos', () => {
  let service: Requisitos;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Requisitos);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
