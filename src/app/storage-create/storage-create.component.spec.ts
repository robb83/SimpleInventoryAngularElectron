import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StorageCreateComponent } from './storage-create.component';

describe('StorageCreateComponent', () => {
  let component: StorageCreateComponent;
  let fixture: ComponentFixture<StorageCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StorageCreateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StorageCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
