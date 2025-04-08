import { TestBed } from '@angular/core/testing';

import { ExternalDBService } from './external-db.service';

describe('ExternalDBService', () => {
  let service: ExternalDBService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExternalDBService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
