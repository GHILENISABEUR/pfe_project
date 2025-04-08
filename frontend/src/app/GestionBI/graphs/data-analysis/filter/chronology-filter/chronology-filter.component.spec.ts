import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChronologyFilterComponent } from './chronology-filter.component';

describe('ChronologyFilterComponent', () => {
  let component: ChronologyFilterComponent;
  let fixture: ComponentFixture<ChronologyFilterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChronologyFilterComponent]
    });
    fixture = TestBed.createComponent(ChronologyFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
