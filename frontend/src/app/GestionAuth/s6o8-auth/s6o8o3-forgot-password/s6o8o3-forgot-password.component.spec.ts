import { ComponentFixture, TestBed } from '@angular/core/testing';

import { S6o8o3ForgotPasswordComponent } from './s6o8o3-forgot-password.component';

describe('S6o8o3ForgotPasswordComponent', () => {
  let component: S6o8o3ForgotPasswordComponent;
  let fixture: ComponentFixture<S6o8o3ForgotPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ S6o8o3ForgotPasswordComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(S6o8o3ForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
