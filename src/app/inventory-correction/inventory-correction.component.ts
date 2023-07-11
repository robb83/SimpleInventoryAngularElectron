import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IpcStorageService } from '../ipc-storage.service';
import { HistoryType, ReportStockEntry } from 'app/interface';

@Component({
  selector: 'app-inventory-correction',
  templateUrl: './inventory-correction.component.html',
  styleUrls: ['./inventory-correction.component.css']
})
export class InventoryCorrectionComponent implements OnInit {

  row: ReportStockEntry | null = null;
  pallets = new FormControl('', [ Validators.required, ]);
  quantity = new FormControl('', [Validators.required, ]);
  empties = new FormControl('', [Validators.required, ]);

  constructor(public dialogRef: MatDialogRef<InventoryCorrectionComponent>, @Inject(MAT_DIALOG_DATA) public stock_id: number, public storage: IpcStorageService) {
    
  }

  ngOnInit(): void {
    var self = this;
    this.storage.stockGet(this.stock_id).then(function(row) {
      self.row = row;
      self.pallets.setValue(row.pallets);
      self.quantity.setValue(row.quantity);
      self.empties.setValue(row.empties);
    });
  }

  save(): void {
    if (this.pallets.valid) {
      var data = {
        stock_id: this.stock_id,
        pallets: this.pallets.value,
        quantity: this.quantity.value,
        empties: this.empties.value,
        operation: 'Helyesbítés',
        comment: '',
        type: HistoryType.Set,
      };

      this.storage.stockCorrection(data);
      this.dialogRef.close();
    }
  }
}
