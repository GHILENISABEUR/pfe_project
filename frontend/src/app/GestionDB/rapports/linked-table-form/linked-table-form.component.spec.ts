import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkedTableFormComponent } from './linked-table-form.component';

describe('LinkedTableFormComponent', () => {
  let component: LinkedTableFormComponent;
  let fixture: ComponentFixture<LinkedTableFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LinkedTableFormComponent]
    });
    fixture = TestBed.createComponent(LinkedTableFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
