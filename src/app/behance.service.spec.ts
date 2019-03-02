import { TestBed } from '@angular/core/testing';

import { BehanceService } from './behance.service';

describe('BehanceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BehanceService = TestBed.get(BehanceService);
    expect(service).toBeTruthy();
  });
});
