import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PredValComponent } from './pred-val.component';

describe('PredValComponent', () => {
  let component: PredValComponent;
  let fixture: ComponentFixture<PredValComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PredValComponent]
    });
    fixture = TestBed.createComponent(PredValComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
