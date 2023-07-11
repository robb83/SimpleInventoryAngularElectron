import { Component, OnInit } from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { IpcStorageService } from '../ipc-storage.service';
import { PartnerCreateEntry } from 'app/interface';

@Component({
  selector: 'app-partner-new',
  templateUrl: './partner-new.component.html',
  styleUrls: ['./partner-new.component.css']
})
export class PartnerNewComponent implements OnInit {

  name = new FormControl('', [Validators.required, Validators.minLength(2)]);
  phone = new FormControl('', []);
  email = new FormControl('', []);

  constructor(public dialogRef: MatDialogRef<PartnerNewComponent>, public storage: IpcStorageService) { }

  ngOnInit(): void {
  }

  save(): void {
    if (this.name.valid) {
      var data = {
        name: this.name.value,
        email: this.email.value,
        phone: this.phone.value
      };

      this.storage.partnerCreate(data);
      this.dialogRef.close();
    }
  }

  getErrorMessage() {
    if (this.name.hasError('required')) {
      return 'kötelező';
    }
    return this.name.invalid ? 'túl rövid' : '';
  }
}
