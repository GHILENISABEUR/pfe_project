/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { S6o5o1GestionDBComponent } from './s6o5o1-GestionDB.component';

describe('S6o5o1GestionDBComponent', () => {
  let component: S6o5o1GestionDBComponent;
  let fixture: ComponentFixture<S6o5o1GestionDBComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ S6o5o1GestionDBComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(S6o5o1GestionDBComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
