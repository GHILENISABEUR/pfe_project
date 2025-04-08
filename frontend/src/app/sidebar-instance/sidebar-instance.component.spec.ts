import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarInstanceComponent } from './sidebar-instance.component';

describe('SidebarInstanceComponent', () => {
  let component: SidebarInstanceComponent;
  let fixture: ComponentFixture<SidebarInstanceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SidebarInstanceComponent]
    });
    fixture = TestBed.createComponent(SidebarInstanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
