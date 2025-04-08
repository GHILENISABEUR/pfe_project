/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { S6o8o4ConfirmationMsgComponent } from './s6o8o4-confirmation-msg.component';

describe('S6o8o4ConfirmationMsgComponent', () => {
  let component: S6o8o4ConfirmationMsgComponent;
  let fixture: ComponentFixture<S6o8o4ConfirmationMsgComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ S6o8o4ConfirmationMsgComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(S6o8o4ConfirmationMsgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
