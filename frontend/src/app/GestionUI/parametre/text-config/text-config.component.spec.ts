import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextConfigComponent } from './text-config.component';

describe('TextConfigComponent', () => {
  let component: TextConfigComponent;
  let fixture: ComponentFixture<TextConfigComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TextConfigComponent]
    });
    fixture = TestBed.createComponent(TextConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
