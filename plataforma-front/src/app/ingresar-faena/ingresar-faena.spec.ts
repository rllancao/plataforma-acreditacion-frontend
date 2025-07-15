import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngresarFaena } from './ingresar-faena';

describe('IngresarFaena', () => {
  let component: IngresarFaena;
  let fixture: ComponentFixture<IngresarFaena>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngresarFaena]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IngresarFaena);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
