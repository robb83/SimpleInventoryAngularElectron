import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { StorageBackend, PartnerLookupEntry, ReportPartnerList, PartnerCreateEntry, PartnerUpdateEntry, PartnerEntry, ReportPartnerHistory, ReportPartnerStock, LocationCreateEntry, LocationEntry, LocationLookupEntry, LocationRenameEntry, ItemCreateEntry, ItemLookupEntry, ReportHistoryEntry, ReportStockEntry, ReportHistoryParameters, ReportStockParameters, CorrectionInputParameters, UnloadInputParameters } from "../../app/interface";

export interface ElectronWindow extends Window {
  require(module: string): any;
}

declare let window: ElectronWindow;

@Injectable({ providedIn: 'root',  })
export class IpcStorageService implements StorageBackend {

  private electron: any;
  private subject: Subject<void>;

  constructor() {
    this.subject = new Subject<void>();
    this.electron = window.require('electron');
  }

  unload(data: UnloadInputParameters[]): Promise<string> {
    return this.electron.ipcRenderer.invoke('storage-stock-unload', data);
  }

  documentLoadGenerate(id: string): Promise<void> {
    return this.electron.ipcRenderer.invoke('document-load-generate', id);
  }
  
  documentUnLoadGenerate(id: string): Promise<void> {
    return this.electron.ipcRenderer.invoke('document-unload-generate', id);
  }

  itemSafeInsert(data: ItemCreateEntry): Promise<number> {
    return this.electron.ipcRenderer.invoke('storage-item-safe-insert', data);
  }

  stockGet(id: number): Promise<ReportStockEntry> {
    return this.electron.ipcRenderer.invoke('storage-stock-get', id);
  }

  printToPdf() : void {
    this.electron.ipcRenderer.invoke('print-pdf');
  }

  load(data: ReportHistoryEntry[]): Promise<string> {
    return this.electron.ipcRenderer.invoke('storage-load', data);
  }

  stockCorrection(data: CorrectionInputParameters): Promise<number> {
    return this.electron.ipcRenderer.invoke('storage-stock-correction', data);
  }

  reportHistory(filter: ReportHistoryParameters): Promise<ReportHistoryEntry[]> {
    return this.electron.ipcRenderer.invoke('storage-report-history', filter);
  }

  reportStock(filter: ReportStockParameters): Promise<ReportStockEntry[]> {
    return this.electron.ipcRenderer.invoke('storage-report-stock', filter);
  }

  itemLookup(): Promise<ItemLookupEntry[]> {
    return this.electron.ipcRenderer.invoke('storage-item-lookup');
  }

  itemCreate(data: ItemCreateEntry): Promise<number> {
    return this.electron.ipcRenderer.invoke('storage-item-create', data);
  }

  locationDelete(id: number): Promise<number> {
    return this.electron.ipcRenderer.invoke('storage-location-delete', id);
  }
  
  locationGet(id: number): Promise<LocationEntry> {
    return this.electron.ipcRenderer.invoke('storage-location-get', id);
  }

  locationLookup(): Promise<LocationLookupEntry[]> {
    return this.electron.ipcRenderer.invoke('storage-location-lookup');
  }

  locationCreate(data: LocationCreateEntry): Promise<number> {
    return this.electron.ipcRenderer.invoke('storage-location-create', data);
  }

  locationRename(data: LocationRenameEntry): Promise<number> {
    return this.electron.ipcRenderer.invoke('storage-location-rename', data);
  }

  locationList(): Promise<LocationEntry[]> {
    return this.electron.ipcRenderer.invoke('storage-location-list');
  }
  
  reportPartnerStock(id: number): Promise<ReportPartnerStock[]> {
    return this.electron.ipcRenderer.invoke('storage-report-partner-stock', id);
  }

  reportPartnerHistory(id: number): Promise<ReportPartnerHistory[]> {
    return this.electron.ipcRenderer.invoke('storage-report-partner-history', id);
  }

  partnerGet(id: number): Promise<PartnerEntry> {
    return this.electron.ipcRenderer.invoke('storage-partner-get', id);
  }

  getSubject(): Subject<void> {
    return this.subject;
  }

  partnerCreate(data: PartnerCreateEntry): Promise<number> {
    var self = this;
    return this.electron.ipcRenderer.invoke('storage-partner-create', data).then(function() {
      self.subject.next();
    });
  }

  partnerUpdate(data: PartnerUpdateEntry): Promise<number> {
    var self = this;
    return this.electron.ipcRenderer.invoke('storage-partner-update', data).then(function() {
      self.subject.next();
    });
  }
  
  partnerLookup(): Promise<PartnerLookupEntry[]> {
    var self = this;
    return this.electron.ipcRenderer.invoke('storage-partner-lookup');
  }

  reportPartnerList(): Promise<ReportPartnerList[]> {
    var self = this;
    return this.electron.ipcRenderer.invoke('storage-report-partner-list');
  }

}
