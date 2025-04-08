/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { S6o5o3GestionAccessComponent } from './s6o5o3-GestionAccess.component';

describe('S6o5o3GestionAccessComponent', () => {
  let component: S6o5o3GestionAccessComponent;
  let fixture: ComponentFixture<S6o5o3GestionAccessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ S6o5o3GestionAccessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(S6o5o3GestionAccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
