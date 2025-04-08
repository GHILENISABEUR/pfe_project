import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectionDBComponent } from './connection-db.component';

describe('ConnectionDBComponent', () => {
  let component: ConnectionDBComponent;
  let fixture: ComponentFixture<ConnectionDBComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConnectionDBComponent]
    });
    fixture = TestBed.createComponent(ConnectionDBComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
