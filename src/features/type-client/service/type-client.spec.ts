import { TestBed } from '@angular/core/testing';

import { TypeClient } from './type-client';

describe('TypeClient', () => {
  let service: TypeClient;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TypeClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
