import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HistoryType, ReportStockEntry } from 'app/interface';
import { IpcStorageService } from '../ipc-storage.service';

@Component({
  selector: 'app-inventory-unload',
  templateUrl: './inventory-unload.component.html',
  styleUrls: ['./inventory-unload.component.css']
})
export class InventoryUnloadComponent implements OnInit {

  row: ReportStockEntry | null = null;
  pallets = new FormControl(0, [ Validators.required, ]);
  quantity = new FormControl(0, [Validators.required, ]);
  empties = new FormControl(0, [Validators.required, ]);

  constructor(public dialogRef: MatDialogRef<InventoryUnloadComponent>, @Inject(MAT_DIALOG_DATA) public stock_id: number, public storage: IpcStorageService) {
    
  }

  ngOnInit(): void {
    var self = this;
    this.storage.stockGet(this.stock_id).then(function(row) {
      self.row = row;
    });
  }

  save(): void {
    if (this.pallets.valid && this.quantity.valid && this.empties.valid) {
      this.dialogRef.close({
        stock_id: this.stock_id,
        pallets: this.pallets.value,
        quantity: this.quantity.value,
        empties: this.empties.value
      });
    }
  }
}
