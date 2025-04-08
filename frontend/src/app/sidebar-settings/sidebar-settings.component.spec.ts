import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarSettingsComponent } from './sidebar-settings.component';

describe('SidebarSettingsComponent', () => {
  let component: SidebarSettingsComponent;
  let fixture: ComponentFixture<SidebarSettingsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SidebarSettingsComponent]
    });
    fixture = TestBed.createComponent(SidebarSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
