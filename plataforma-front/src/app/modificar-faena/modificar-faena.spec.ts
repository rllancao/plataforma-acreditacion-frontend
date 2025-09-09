import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModificarFaena } from './modificar-faena';

describe('ModificarFaena', () => {
  let component: ModificarFaena;
  let fixture: ComponentFixture<ModificarFaena>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModificarFaena]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModificarFaena);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
