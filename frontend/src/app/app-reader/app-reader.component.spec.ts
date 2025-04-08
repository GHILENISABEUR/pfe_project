import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppReaderComponent } from './app-reader.component';

describe('AppReaderComponent', () => {
  let component: AppReaderComponent;
  let fixture: ComponentFixture<AppReaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AppReaderComponent]
    });
    fixture = TestBed.createComponent(AppReaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
