import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarprincipaleComponent } from './navbarprincipale.component';

describe('NavbarprincipaleComponent', () => {
  let component: NavbarprincipaleComponent;
  let fixture: ComponentFixture<NavbarprincipaleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NavbarprincipaleComponent]
    });
    fixture = TestBed.createComponent(NavbarprincipaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
