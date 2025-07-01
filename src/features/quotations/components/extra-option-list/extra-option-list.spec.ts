import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtraOptionList } from './extra-option-list';

describe('ExtraOptionList', () => {
  let component: ExtraOptionList;
  let fixture: ComponentFixture<ExtraOptionList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExtraOptionList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExtraOptionList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
