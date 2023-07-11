import { Component, OnInit } from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-storage-create',
  templateUrl: './storage-create.component.html',
  styleUrls: ['./storage-create.component.css']
})
export class StorageCreateComponent implements OnInit {

  name = new FormControl('', [Validators.required, Validators.minLength(1)]);

  constructor(public dialogRef: MatDialogRef<StorageCreateComponent>) 
  {

  }

  ngOnInit(): void {

    this.dialogRef.keydownEvents().subscribe(event => {
        if (event.key === "Escape") 
        {
          this.dialogRef.close(null);
          return;
        }

        if (event.key === "Enter") 
        {
          this.save();
        }
    });
  }

  save(): void {
    if (this.name.valid)
    {
      this.dialogRef.close(this.name.value);
    }
  }

  getErrorMessage() {
    
    if (this.name.hasError('required')) 
    {
      return 'kötelező';
    }

    return this.name.hasError('name') ? 'túl rövid' : '';
  }
}
