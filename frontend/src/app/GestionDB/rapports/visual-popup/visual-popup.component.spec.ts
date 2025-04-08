import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualPopupComponent } from './visual-popup.component';

describe('VisualPopupComponent', () => {
  let component: VisualPopupComponent;
  let fixture: ComponentFixture<VisualPopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VisualPopupComponent]
    });
    fixture = TestBed.createComponent(VisualPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
