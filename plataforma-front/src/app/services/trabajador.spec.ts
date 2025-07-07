import { TestBed } from '@angular/core/testing';

import { Trabajador } from './trabajador';

describe('Trabajador', () => {
  let service: Trabajador;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Trabajador);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
