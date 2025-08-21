import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpresaDashboard } from './empresa-dashboard';

describe('EmpresaDashboard', () => {
  let component: EmpresaDashboard;
  let fixture: ComponentFixture<EmpresaDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpresaDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpresaDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
