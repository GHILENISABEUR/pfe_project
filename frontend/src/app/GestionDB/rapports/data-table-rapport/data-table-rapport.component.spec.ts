import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataTableRapportComponent } from './data-table-rapport.component';

describe('DataTableRapportComponent', () => {
  let component: DataTableRapportComponent;
  let fixture: ComponentFixture<DataTableRapportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DataTableRapportComponent]
    });
    fixture = TestBed.createComponent(DataTableRapportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
