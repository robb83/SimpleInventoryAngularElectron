import { AfterViewInit, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { IpcStorageService } from '../ipc-storage.service';
import { HistoryType, ReportHistoryEntry, ReportHistoryParameters } from 'app/interface';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-inventory-history',
  templateUrl: './inventory-history.component.html',
  styleUrls: ['./inventory-history.component.css']
})
export class InventoryHistoryComponent implements AfterViewInit {

  filter: ReportHistoryParameters;

  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });
  
  pageSize: number = 25;
  displayedColumns: string[] = [ 'partner_name', 'item_name', 'location_name', 'pallets', 'quantity', 'empties', 'operation', 'created' ];
  dataSource = new MatTableDataSource<ReportHistoryEntry>();
  
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(public storage: IpcStorageService) { 
    this.filter = {};
  }
  
  ngOnInit() {
    this.updatePageSize();
  }

  ngAfterViewInit() {
    var self = this;
    this.dataSource.filterPredicate = function(data: any, filter: string): boolean {
      if (self.filter?.partner) {
        var a = self.filter.partner.trim().toLocaleLowerCase();
        var b = data.partner_name.trim().toLocaleLowerCase();
  
        if (!b.includes(a)) return false;
      }
  
      if (self.filter?.item) {
        var a = self.filter.item.trim().toLocaleLowerCase();
        var b = data.item_name.trim().toLocaleLowerCase();
  
        if (!b.includes(a)) return false;
      }
  
      if (self.filter?.location) {
        var a = self.filter.location.trim().toLocaleLowerCase();
        var b = data.location_name.trim().toLocaleLowerCase();
  
        if (!b.includes(a)) return false;
      }
  
      if (self.filter?.operation) {
        var a = self.filter.operation.trim().toLocaleLowerCase();
        var b = data.operation.trim().toLocaleLowerCase();
  
        if (!b.includes(a)) return false;
      }
  
      if (self.filter?.updatedFrom && data.created < self.filter.updatedFrom) {
        return false;
      }
  
      if (self.filter?.updatedTo && data.created > self.filter.updatedTo) {
        return false;
      }
  
      return true;
    };
    
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    var self = this;
    this.storage.reportHistory({}).then(function(rows) {
      self.dataSource.data = rows;
    });
  }

  updatePageSize() {
    var ps = Math.round((window.innerHeight - 210 - 24) / 48);
    ps = ( ps > 100 ? 100 : ps < 1 ? 10 : ps);
    this.pageSize = ps;
    if (this.paginator) {
      this.paginator._changePageSize(ps);
    }
  }
  
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.updatePageSize();
  }

  onUpdateFrom(event: any) { 
    this.filter.updatedFrom = event.value;
    this.dataSource.filter = new Date().toString();
  }

  onUpdateTo(event: any) {
    this.filter.updatedTo = event.value;
    this.dataSource.filter = new Date().toString();
  }
  
  onLocationNameFilterChanged(event: any) {
    this.filter.location = event.target.value;
    this.dataSource.filter = new Date().toString();
  }

  onItemNameFilterChanged(event: any) {
    this.filter.item = event.target.value;
    this.dataSource.filter = new Date().toString();
  }

  onPartnerNameFilterChanged(event: any) {
    this.filter.partner = event.target.value;
    this.dataSource.filter = new Date().toString();
  }

  onOperationFilterChanged(event: any) {
    this.filter.operation = event.target.value;
    this.dataSource.filter = new Date().toString();
  }

  announceSortChange(sortState: Sort) {
  }

  getColoring(value: number, type: HistoryType) {
    if (type == HistoryType.Add) {
      return (value > 0 ? 'cell-green' : value < 0 ? 'cell-red' : 'cell-normal');
    }

    return 'cell-normal';
  }

  getNumberFormat(value: number, type: HistoryType) {
    if (type == HistoryType.Add) {
      return (value > 0 ? " + " + value.toString() : value < 0 ? " - " + (Math.abs(value)) : value.toString());
    }

    return value.toString();
  }
}