import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OlvidastePass } from './olvidaste-pass';

describe('OlvidastePass', () => {
  let component: OlvidastePass;
  let fixture: ComponentFixture<OlvidastePass>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OlvidastePass]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OlvidastePass);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
