import { TestBed } from '@angular/core/testing';

import { FromDBService } from './from-db.service';

describe('FromDBService', () => {
  let service: FromDBService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FromDBService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
