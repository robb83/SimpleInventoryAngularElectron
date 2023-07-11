import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import { ReportStockEntry } from 'app/interface';
import { IpcStorageService } from '../ipc-storage.service';

@Component({
  selector: 'app-unload',
  templateUrl: './unload.component.html',
  styleUrls: ['./unload.component.css']
})
export class UnloadComponent implements AfterViewInit {
  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });
  displayedColumns: string[] = [ 'partner_name', 'item_name', 'location_name', 'pallets', 'quantity', 'empties', 'updated', 'actions' ];
  dataSource = new MatTableDataSource<ReportStockEntry>();

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(public storage: IpcStorageService) { 
    
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
    var self = this;
    this.storage.reportStock({}).then(function(rows) {
      self.dataSource.data = rows;
    });
  }

  announceSortChange(sortState: Sort) {
  }
}