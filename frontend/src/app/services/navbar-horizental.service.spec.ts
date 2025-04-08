import { TestBed } from '@angular/core/testing';

import { NavbarHorizentalService } from './navbar-horizental.service';

describe('NavbarHorizentalService', () => {
  let service: NavbarHorizentalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NavbarHorizentalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
