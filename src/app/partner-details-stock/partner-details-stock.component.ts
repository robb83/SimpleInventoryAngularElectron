import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { IpcStorageService } from '../ipc-storage.service';
import { ReportPartnerStock } from 'app/interface';

@Component({
  selector: 'app-partner-details-stock',
  templateUrl: './partner-details-stock.component.html',
  styleUrls: ['./partner-details-stock.component.css']
})
export class PartnerDetailsStockComponent implements AfterViewInit {

  @Input() partnerId:number = -1;
  
  displayedColumns: string[] = [ 'item_name', 'pallets', 'quantity', 'empties', 'updated' ];
  dataSource = new MatTableDataSource<ReportPartnerStock>();
  
  @ViewChild(MatSort) sort!: MatSort;

  constructor(public storage: IpcStorageService) {
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    
    var self = this;
    this.storage.reportPartnerStock(this.partnerId).then(function(rows) {
      self.dataSource.data = rows;
    });
  }

  announceSortChange(sortState: Sort) {
  }
}