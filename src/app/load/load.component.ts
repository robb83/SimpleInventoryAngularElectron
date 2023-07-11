import { Component, OnInit, AfterViewInit, ViewChild, QueryList, ViewContainerRef, ElementRef } from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable, Subject} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatRow } from '@angular/material/table';
import { HistoryType, ItemLookupEntry, LocationLookupEntry, PartnerLookupEntry } from 'app/interface';
import { IpcStorageService } from '../ipc-storage.service';


export interface LoadInputEntry {
  partnerFilter: string | null;
  partner: PartnerLookupEntry | null;
  nameFilter: string | null;
  name: ItemLookupEntry | null;
  locationFilter: string | null;
  location: LocationLookupEntry | null;
  pallets: number;
  quantity: number;
  empties: number;
}

@Component({
  selector: 'app-load',
  templateUrl: './load.component.html',
  styleUrls: ['./load.component.css']
})
export class LoadComponent implements AfterViewInit {
  displayedColumns: string[] = [ 'partner', 'name', 'location', 'pallets', 'quantity', 'empties' ];
  dataSource = new MatTableDataSource<LoadInputEntry>();

  public filteredPartners$: Observable<PartnerLookupEntry[]>;
  public stateInputChange$: Subject<string>=new Subject<string>();
  private partners: PartnerLookupEntry[] = [];

  public filteredStockItemLocation$: Observable<LocationLookupEntry[]>;
  public stockItemLocationInputChange$: Subject<string>=new Subject<string>();
  private locations: LocationLookupEntry[] = [];
  
  public filteredStockItem$: Observable<ItemLookupEntry[]>;
  public stockItemInputChange$: Subject<string>=new Subject<string>();
  private stockItems: ItemLookupEntry[] = [];

  @ViewChild('inputTable', {read: ElementRef}) table!: ElementRef;

  constructor(public storage: IpcStorageService) {

    this.filteredPartners$=this.stateInputChange$.pipe(
       startWith(''),
       map(value => this._filterPartner(value)),
    );

    this.filteredStockItemLocation$ = this.stockItemLocationInputChange$.pipe(
      startWith(''),
      map(value => this._filterLocation(value)),
    );

    this.filteredStockItem$ = this.stockItemInputChange$.pipe(
      startWith(''),
      map(value => this._filterStockItem(value)),
    );

    this.newrow(null);
  }

  ngAfterViewInit(): void {
    var self = this;
    
    this.storage.partnerLookup().then(function(rows) {
      self.partners = rows;

      self.filteredPartners$=self.stateInputChange$.pipe(
         startWith(''),
         map(value => self._filterPartner(value)),
      );
    });
    
    this.storage.locationLookup().then(function(rows) {
      self.locations = rows;

      self.filteredStockItemLocation$ = self.stockItemLocationInputChange$.pipe(
        startWith(''),
        map(value => self._filterLocation(value)),
      );
    });

    this.storage.itemLookup().then(function(rows) {
      self.stockItems = rows;

      self.filteredStockItem$ = self.stockItemInputChange$.pipe(
        startWith(''),
        map(value => self._filterStockItem(value)),
      );
    });
  }

  _filterPartner(value: string): PartnerLookupEntry[] {
    const filterValue = value.toLowerCase();
    return this.partners.filter(p => p.name.toLowerCase().includes(filterValue));
  }

  _filterLocation(value: string): LocationLookupEntry[] {
    const filterValue = value.toLowerCase();
    return this.locations.filter(p => p.name.toLowerCase().includes(filterValue));
  }

  _filterStockItem(value: string): ItemLookupEntry[] {
    const filterValue = value.toLowerCase();
    return this.stockItems.filter(p => p.name.toLowerCase().includes(filterValue));
  }

  getLookupOptionText(option: any) {
    if (typeof option === 'string' || option instanceof String)
    {
      return option;
    } else if (option){
      return option.name;
    }

    return undefined;
  }

  selectedPartner(row:any , current:any) {
    row.partner = current;
    row.partnerFilter = current.name;
  }

  selectedStockItem(row:any , current:any) {
    row.name = current;
    row.nameFilter = current.name;
  }

  selectedStockLocation(row:any , current:any) {
    row.location = current;
    row.locationFilter = current.name;
  }

  async load() {
    var data = this.dataSource.data.map(function (v) {

      if (v.name?.id && v.name.name != v.nameFilter) {
        v.name = null;
      }

      if (v.location?.id && v.location.name != v.locationFilter) {
        v.location = null;
      }
      
      if (v.partner?.id && v.partner.name != v.partnerFilter) {
        v.partner = null;
      }

      return {
          item_id: v.name?.id || -1,
          item_name: v.name?.name || v.nameFilter || '',
          pallets: v.pallets,
          quantity: v.quantity,
          empties: v.empties,
          location_id: v.location?.id || -1,
          location_name: (v.location?.name || v.locationFilter) || '',
          partner_id: v.partner?.id || -1,
          partner_name: v.partner?.name || v.partnerFilter || '',
          operation: "Betáraz",
          id: -1,
          created: new Date(),
          comment: '',
          group: '',
          type: HistoryType.Add
      };
    });

    for (var d = 0; d < data.length; ++d) {
      if (data[d].partner_id < 1) {
        return;
      }
      
      if (data[d].location_id < 1) {
        return;
      }
    }

    await data.reduce(async (memo, row, index ) => {
      await memo;

      if (!row.item_id) {
        var x = await this.storage.itemSafeInsert({ name: row.item_name });
        row.item_id = x;
      }
    }, {});

    var self = this;
    this.storage.load(data).then(function(groupid) {
       self.dataSource.data = [];
       self.newrow(null);

       self.storage.documentLoadGenerate(groupid);
    });

    // window.open(window.location.href);
    // this.storage.printToPdf();
  }

  announceSortChange(sortState: Sort) {
  }

  newrow(current:any) {

    var nr = {
      pallets: 0, 
      name: null, 
      nameFilter: null, 
      quantity: 0, 
      empties: 0, 
      partner: null, 
      partnerFilter: null, 
      location: null, 
      locationFilter: null 
    };

    if (current !== null) {
      nr.partner = current.partner;
      nr.partnerFilter = current.partnerFilter;
    }

    this.dataSource.data.push(nr);
    this.dataSource.filter = '';

    var self = this;
    if (self.table) {
      self.table.nativeElement.rows[ self.table.nativeElement.rows.length - 1 ].querySelector('input').focus()
    }
  }
}