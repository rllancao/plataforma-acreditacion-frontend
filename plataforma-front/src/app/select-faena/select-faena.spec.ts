import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectFaena } from './select-faena';

describe('SelectFaena', () => {
  let component: SelectFaena;
  let fixture: ComponentFixture<SelectFaena>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectFaena]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectFaena);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
