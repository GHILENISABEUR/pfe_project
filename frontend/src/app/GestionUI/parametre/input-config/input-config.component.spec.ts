import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputConfigComponent } from './input-config.component';

describe('InputConfigComponent', () => {
  let component: InputConfigComponent;
  let fixture: ComponentFixture<InputConfigComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InputConfigComponent]
    });
    fixture = TestBed.createComponent(InputConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
