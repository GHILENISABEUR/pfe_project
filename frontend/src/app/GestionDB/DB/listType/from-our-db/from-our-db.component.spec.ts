import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FromOurDBComponent } from './from-our-db.component';

describe('FromOurDBComponent', () => {
  let component: FromOurDBComponent;
  let fixture: ComponentFixture<FromOurDBComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FromOurDBComponent]
    });
    fixture = TestBed.createComponent(FromOurDBComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
