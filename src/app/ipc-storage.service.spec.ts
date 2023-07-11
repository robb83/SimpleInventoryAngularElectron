import { TestBed } from '@angular/core/testing';

import { IpcStorageService } from './ipc-storage.service';

describe('IpcStorageService', () => {
  let service: IpcStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IpcStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
