import { AfterViewInit, Component, HostListener, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { IpcStorageService } from '../ipc-storage.service';
import { ReportPartnerList } from 'app/interface';
import { PartnerDetailComponent } from '../partner-detail/partner-detail.component';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { CdkTable } from '@angular/cdk/table';

@Component({
  selector: 'app-partners',
  templateUrl: './partners.component.html',
  styleUrls: ['./partners.component.css']
})
export class PartnersComponent implements AfterViewInit {

  pageSize: number = 25;
  displayedColumns: string[] = [ 'partner_name', 'partner_phone', 'partner_email', 'updated', 'pallets', 'empties', 'actions' ];
  dataSource = new MatTableDataSource<ReportPartnerList>();
  storageSubscription: Subscription;
  
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(public dialog: MatDialog, public storage: IpcStorageService) {
    var self = this;
    this.storageSubscription = storage.getSubject().subscribe(function() {
      self.ngAfterViewInit();
    });
  }
  
  ngOnDestroy() {
    if (this.storageSubscription) {
      this.storageSubscription.unsubscribe();
    }
  }
  
  ngOnInit() {
    this.updatePageSize();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    var self = this;
    this.storage.reportPartnerList().then(function(rows) {
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

  onSortChange(sortState: Sort) {
  }

  onSearchChange(event: any): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  editConfig(partner: any) {
    const dialogRef = this.dialog.open(PartnerDetailComponent, {
      data: partner.partner_id,
      disableClose: true,
      hasBackdrop: true
    });
  }
}