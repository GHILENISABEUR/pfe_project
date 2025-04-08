import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarInstanceGraphComponent } from './sidebar-instance-graph.component';

describe('SidebarInstanceGraphComponent', () => {
  let component: SidebarInstanceGraphComponent;
  let fixture: ComponentFixture<SidebarInstanceGraphComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SidebarInstanceGraphComponent]
    });
    fixture = TestBed.createComponent(SidebarInstanceGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
