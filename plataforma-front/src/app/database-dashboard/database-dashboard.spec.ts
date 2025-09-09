import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatabaseDashboard } from './database-dashboard';

describe('DatabaseDashboard', () => {
  let component: DatabaseDashboard;
  let fixture: ComponentFixture<DatabaseDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatabaseDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatabaseDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
