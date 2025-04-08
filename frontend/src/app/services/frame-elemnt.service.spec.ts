import { TestBed } from '@angular/core/testing';

import { FrameElemntService } from './frame-elemnt.service';

describe('FrameElemntService', () => {
  let service: FrameElemntService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FrameElemntService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
