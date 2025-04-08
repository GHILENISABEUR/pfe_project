import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExcelTabComponent } from './excel-tab.component';

describe('ExcelTabComponent', () => {
  let component: ExcelTabComponent;
  let fixture: ComponentFixture<ExcelTabComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExcelTabComponent]
    });
    fixture = TestBed.createComponent(ExcelTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
