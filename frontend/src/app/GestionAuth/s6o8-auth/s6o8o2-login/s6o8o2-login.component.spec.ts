import { ComponentFixture, TestBed } from '@angular/core/testing';

import { S6o8o2LoginComponent } from './s6o8o2-login.component';

describe('S6o8o2LoginComponent', () => {
  let component: S6o8o2LoginComponent;
  let fixture: ComponentFixture<S6o8o2LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ S6o8o2LoginComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(S6o8o2LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
