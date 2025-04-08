import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConceptionTableComponent } from './conception-table.component';

describe('ConceptionTableComponent', () => {
  let component: ConceptionTableComponent;
  let fixture: ComponentFixture<ConceptionTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConceptionTableComponent]
    });
    fixture = TestBed.createComponent(ConceptionTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
