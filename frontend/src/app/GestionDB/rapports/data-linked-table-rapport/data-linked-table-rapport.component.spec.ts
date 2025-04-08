import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataLinkedTableRapportComponent } from './data-linked-table-rapport.component';

describe('DataLinkedTableRapportComponent', () => {
  let component: DataLinkedTableRapportComponent;
  let fixture: ComponentFixture<DataLinkedTableRapportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DataLinkedTableRapportComponent]
    });
    fixture = TestBed.createComponent(DataLinkedTableRapportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
