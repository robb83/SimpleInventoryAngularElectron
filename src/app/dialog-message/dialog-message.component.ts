import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogMessageInfo {  
  title: string;
  message: string;
};

@Component({
  selector: 'app-dialog-message',
  templateUrl: './dialog-message.component.html',
  styleUrls: ['./dialog-message.component.css']
})
export class DialogMessageComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<DialogMessageComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogMessageInfo) { 
    
  }

  ngOnInit(): void {
  }

}
