import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectProductType } from './select-product-type';

describe('SelectProductType', () => {
  let component: SelectProductType;
  let fixture: ComponentFixture<SelectProductType>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectProductType]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectProductType);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
