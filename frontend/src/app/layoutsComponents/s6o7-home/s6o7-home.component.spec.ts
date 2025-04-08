import { ComponentFixture, TestBed } from '@angular/core/testing';

import { S6o7HomeComponent } from './s6o7-home.component';

describe('S6o7HomeComponent', () => {
  let component: S6o7HomeComponent;
  let fixture: ComponentFixture<S6o7HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ S6o7HomeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(S6o7HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
