import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarGraphsComponent } from './sidebar-graphs.component';

describe('SidebarGraphsComponent', () => {
  let component: SidebarGraphsComponent;
  let fixture: ComponentFixture<SidebarGraphsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SidebarGraphsComponent]
    });
    fixture = TestBed.createComponent(SidebarGraphsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
