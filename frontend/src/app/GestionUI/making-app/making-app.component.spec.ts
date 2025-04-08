import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MakingAppComponent } from './making-app.component';

describe('MakingAppComponent', () => {
  let component: MakingAppComponent;
  let fixture: ComponentFixture<MakingAppComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MakingAppComponent]
    });
    fixture = TestBed.createComponent(MakingAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
