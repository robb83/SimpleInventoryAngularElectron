import { Component, Inject, OnInit } from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PartnerEntry } from 'app/interface';
import { IpcStorageService } from '../ipc-storage.service';

@Component({
  selector: 'app-partner-detail',
  templateUrl: './partner-detail.component.html',
  styleUrls: ['./partner-detail.component.css']
})
export class PartnerDetailComponent implements OnInit {
  
  partner: PartnerEntry | null;
  name = new FormControl('', [Validators.required, Validators.minLength(2)]);
  phone = new FormControl('', []);
  email = new FormControl('', []);

  constructor(public dialogRef: MatDialogRef<PartnerDetailComponent>, @Inject(MAT_DIALOG_DATA) public partnerId: number, public storage: IpcStorageService) {
    this.partner = null;

    var self = this;
    storage.partnerGet(partnerId).then(function(data) {
      self.partner = data;
      self.name.setValue(data.name);
      self.phone.setValue(data.phone);
      self.email.setValue(data.email);
    });
  }
  
  ngOnInit(): void {
    this.dialogRef.updateSize('90%');
  }

  getErrorMessage() {
    if (this.name.hasError('required')) {
      return 'kötelező';
    }
    return this.name.invalid ? 'túl rövid' : '';
  }

  save(): void {
    if (this.name.valid) {
      var data = {
        id: this.partnerId,
        name: this.name.value,
        email: this.email.value,
        phone: this.phone.value
      };

      this.storage.partnerUpdate(data);
    }
  }
}
