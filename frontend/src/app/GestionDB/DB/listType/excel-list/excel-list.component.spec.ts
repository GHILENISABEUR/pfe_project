import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExcelListComponent } from './excel-list.component';

describe('ExcelListComponent', () => {
  let component: ExcelListComponent;
  let fixture: ComponentFixture<ExcelListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExcelListComponent]
    });
    fixture = TestBed.createComponent(ExcelListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
