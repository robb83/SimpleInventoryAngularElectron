import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { IpcStorageService } from '../ipc-storage.service';
import { HistoryType, ReportPartnerHistory } from 'app/interface';

@Component({
  selector: 'app-partner-details-stock-history',
  templateUrl: './partner-details-stock-history.component.html',
  styleUrls: ['./partner-details-stock-history.component.css']
})
export class PartnerDetailsStockHistoryComponent implements AfterViewInit {

  @Input() partnerId:number = -1;
  
  displayedColumns: string[] = [ 'item_name', 'pallets', 'quantity', 'empties', 'operation', 'created' ];
  dataSource = new MatTableDataSource<ReportPartnerHistory>();
  
  @ViewChild(MatSort) sort!: MatSort;

  constructor(public storage: IpcStorageService) {
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;

    var self = this;
    this.storage.reportPartnerHistory(this.partnerId).then(function(rows) {
      self.dataSource.data = rows;
    });
  }

  announceSortChange(sortState: Sort) {
  }

  getColoring(value: number, type: HistoryType) {
    if (type == HistoryType.Add) {
      return (value > 0 ? 'cell-green' : value < 0 ? 'cell-red' : '');
    }

    return '';
  }

  getNumberFormat(value: number, type: HistoryType) {
    if (type == HistoryType.Add) {
      return (value > 0 ? " + " + value.toString() : value < 0 ? " - " + (Math.abs(value)) : value.toString());
    }

    return value.toString();
  }
}