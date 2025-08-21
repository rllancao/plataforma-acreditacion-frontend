import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngresarEmpleado } from './ingresar-empleado';

describe('IngresarEmpleado', () => {
  let component: IngresarEmpleado;
  let fixture: ComponentFixture<IngresarEmpleado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngresarEmpleado]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IngresarEmpleado);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
