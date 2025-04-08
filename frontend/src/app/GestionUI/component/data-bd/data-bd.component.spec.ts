import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataBDComponent } from './data-bd.component';

describe('DataBDComponent', () => {
  let component: DataBDComponent;
  let fixture: ComponentFixture<DataBDComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DataBDComponent]
    });
    fixture = TestBed.createComponent(DataBDComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
