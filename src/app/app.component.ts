import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PartnerNewComponent } from './partner-new/partner-new.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'Simple storage handler';
  
  constructor(public dialog: MatDialog) { 
  }

  createNew() {
    const dialogRef = this.dialog.open(PartnerNewComponent, {
      minWidth: '50%',
      disableClose: true,
      hasBackdrop: true
    });
  }
}
