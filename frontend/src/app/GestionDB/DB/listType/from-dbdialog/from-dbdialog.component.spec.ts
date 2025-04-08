import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FromDBDialogComponent } from './from-dbdialog.component';

describe('FromDBDialogComponent', () => {
  let component: FromDBDialogComponent;
  let fixture: ComponentFixture<FromDBDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FromDBDialogComponent]
    });
    fixture = TestBed.createComponent(FromDBDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
