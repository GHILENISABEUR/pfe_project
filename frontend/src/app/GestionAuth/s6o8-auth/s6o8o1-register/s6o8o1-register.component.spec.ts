import { ComponentFixture, TestBed } from '@angular/core/testing';

import { S6o8o1RegisterComponent } from './s6o8o1-register.component';

describe('S6o7RegisterComponent', () => {
  let component: S6o8o1RegisterComponent;
  let fixture: ComponentFixture<S6o8o1RegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [S6o8o1RegisterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(S6o8o1RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
