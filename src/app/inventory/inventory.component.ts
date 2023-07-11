import { AfterViewInit, Component, HostListener, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import { HistoryType, ReportStockEntry, ReportStockParameters, UnloadInputParameters } from 'app/interface';
import { IpcStorageService } from '../ipc-storage.service';
import { InventoryCorrectionComponent } from '../inventory-correction/inventory-correction.component';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, TemplatePortalDirective } from '@angular/cdk/portal';
import { InventoryUnloadComponent } from '../inventory-unload/inventory-unload.component';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent implements AfterViewInit {

  unloads: UnloadInputParameters[] = [];
  pageSize: number = 25;
  overlayRef: OverlayRef | undefined = undefined;

  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });

  filter: ReportStockParameters;

  displayedColumns: string[] = [ 'partner_name', 'item_name', 'location_name', 'pallets', 'quantity', 'empties', 'updated', 'actions' ];
  dataSource = new MatTableDataSource<ReportStockEntry>();
  
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('inlineEditorTemplate') inlineEditorTemplate!: TemplateRef<any>;

  constructor(public overlay: Overlay, public viewContainerRef: ViewContainerRef, public dialog: MatDialog, public storage: IpcStorageService) {
    this.filter = { };    
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
    this.storage.reportStock({ stocked: true}).then(function(rows) {
      self.dataSource.data = rows;
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.updatePageSize();
  }
  
  announceSortChange(sortState: Sort) {
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

  updatePageSize() {
    var ps = Math.round((window.innerHeight - 210 - 24) / 48);
    ps = ( ps > 100 ? 100 : ps < 1 ? 10 : ps);
    this.pageSize = ps;
    if (this.paginator) {
      this.paginator._changePageSize(ps);
    }
  }

  getColoring(value: number) {
    if (value > 0)
    {
      return 'cell-green';
    } 
    else if ( value < 0) 
    {
      return 'cell-red';
    }

    return '';
  }

  getNumberFormat(value: number) {
    
    if (value > 0)
    {
      return value.toString();
    } 
    else if ( value < 0) 
    {
      return value.toString();
    }

    return value.toString();
  }

  correction(row: any) {
    var self = this;

    const dialogRef = self.dialog.open(InventoryCorrectionComponent, {
      data: row.id,
      disableClose: true,
      hasBackdrop: true
    });
    dialogRef.afterClosed().subscribe(result => {
      self.ngAfterViewInit();
    });
  }

  unload(row: any) {
    var self = this;

    const dialogRef = self.dialog.open(InventoryUnloadComponent, {
      data: row.id,
      disableClose: true,
      hasBackdrop: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        self.unloads.push({
          stock_id: result.stock_id,
          empties: result.empties,
          pallets: result.pallets,
          quantity: result.quantity,
          comment: '',
          operation: 'Kitárazás',
          type: HistoryType.Sub
        });
      }
    });
  }

  do_unload() {
    if (this.unloads.length > 0) {
      var self = this;

      self.storage.unload(this.unloads).then(function(groupid) {
        self.unloads = [];
        self.storage.documentUnLoadGenerate(groupid);
        self.ngAfterViewInit();
      });
    }
  }
}