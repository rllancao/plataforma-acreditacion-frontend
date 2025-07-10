import { TestBed } from '@angular/core/testing';

import { ResetPassword } from './reset-password';

describe('ResetPassword', () => {
  let service: ResetPassword;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResetPassword);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
