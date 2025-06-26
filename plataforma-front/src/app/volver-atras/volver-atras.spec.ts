import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VolverAtras } from './volver-atras';

describe('VolverAtras', () => {
  let component: VolverAtras;
  let fixture: ComponentFixture<VolverAtras>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VolverAtras]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VolverAtras);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
