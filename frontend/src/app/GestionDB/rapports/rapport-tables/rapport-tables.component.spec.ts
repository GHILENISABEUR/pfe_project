import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RapportTablesComponent } from './rapport-tables.component';

describe('RapportTablesComponent', () => {
  let component: RapportTablesComponent;
  let fixture: ComponentFixture<RapportTablesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RapportTablesComponent]
    });
    fixture = TestBed.createComponent(RapportTablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
