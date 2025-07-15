import { TestBed } from '@angular/core/testing';

import { OrderStatuses } from './order-statuses';

describe('OrderStatuses', () => {
  let service: OrderStatuses;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderStatuses);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
