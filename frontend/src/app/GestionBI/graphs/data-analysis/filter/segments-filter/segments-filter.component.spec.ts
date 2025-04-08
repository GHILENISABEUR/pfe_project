import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SegmentsFilterComponent } from './segments-filter.component';

describe('SegmentsFilterComponent', () => {
  let component: SegmentsFilterComponent;
  let fixture: ComponentFixture<SegmentsFilterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SegmentsFilterComponent]
    });
    fixture = TestBed.createComponent(SegmentsFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
