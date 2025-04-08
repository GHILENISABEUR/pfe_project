import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsequencesComponent } from './consequences.component';

describe('ConsequencesComponent', () => {
  let component: ConsequencesComponent;
  let fixture: ComponentFixture<ConsequencesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsequencesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsequencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
