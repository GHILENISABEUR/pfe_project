/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { S6o5o2GestionRapportsComponent } from './s6o5o2-GestionRapports.component';

describe('S6o5o2GestionRapportsComponent', () => {
  let component: S6o5o2GestionRapportsComponent;
  let fixture: ComponentFixture<S6o5o2GestionRapportsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ S6o5o2GestionRapportsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(S6o5o2GestionRapportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
