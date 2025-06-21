import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtraOption } from './extra-option';

describe('ExtraOption', () => {
  let component: ExtraOption;
  let fixture: ComponentFixture<ExtraOption>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExtraOption]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExtraOption);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
