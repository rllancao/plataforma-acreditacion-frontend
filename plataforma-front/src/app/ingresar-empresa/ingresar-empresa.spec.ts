import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngresarEmpresa } from './ingresar-empresa';

describe('IngresarEmpresa', () => {
  let component: IngresarEmpresa;
  let fixture: ComponentFixture<IngresarEmpresa>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngresarEmpresa]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IngresarEmpresa);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
