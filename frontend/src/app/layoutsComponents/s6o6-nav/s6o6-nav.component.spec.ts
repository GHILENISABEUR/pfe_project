import { ComponentFixture, TestBed } from '@angular/core/testing';

import { S6o6NavComponent } from './s6o6-nav.component';

describe('S6o6NavComponent', () => {
  let component: S6o6NavComponent;
  let fixture: ComponentFixture<S6o6NavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ S6o6NavComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(S6o6NavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
