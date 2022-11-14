import { TestBed } from '@angular/core/testing';

import { CropMonitoringService } from './crop-monitoring.service';

describe('CropMonitoringService', () => {
  let service: CropMonitoringService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CropMonitoringService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
