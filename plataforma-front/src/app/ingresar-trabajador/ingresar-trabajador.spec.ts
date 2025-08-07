import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngresarTrabajador } from './ingresar-trabajador';

describe('IngresarTrabajador', () => {
  let component: IngresarTrabajador;
  let fixture: ComponentFixture<IngresarTrabajador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngresarTrabajador]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IngresarTrabajador);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
