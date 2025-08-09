import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdersSearch } from './orders-search';

describe('OrdersSearch', () => {
  let component: OrdersSearch;
  let fixture: ComponentFixture<OrdersSearch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdersSearch]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrdersSearch);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
