import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarSettingsGraphsComponent } from './sidebar-settings-graphs.component';

describe('SidebarSettingsGraphsComponent', () => {
  let component: SidebarSettingsGraphsComponent;
  let fixture: ComponentFixture<SidebarSettingsGraphsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SidebarSettingsGraphsComponent]
    });
    fixture = TestBed.createComponent(SidebarSettingsGraphsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
