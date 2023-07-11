import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MaterialModule } from './material.module';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PartnersComponent } from './partners/partners.component';
import { StoragesComponent } from './storages/storages.component';
import { PartnerDetailComponent } from './partner-detail/partner-detail.component';
import { PartnerDetailsStockComponent } from './partner-details-stock/partner-details-stock.component';
import { PartnerDetailsStockHistoryComponent } from './partner-details-stock-history/partner-details-stock-history.component';
import { PartnerNewComponent } from './partner-new/partner-new.component';
import { InventoryComponent } from './inventory/inventory.component';
import { InventoryHistoryComponent } from './inventory-history/inventory-history.component';
import { LoadComponent } from './load/load.component';
import { TabDirective } from './tab-directive.directive';
import { UnloadComponent } from './unload/unload.component';
import { StorageCreateComponent } from './storage-create/storage-create.component';
import { DialogMessageComponent } from './dialog-message/dialog-message.component';
import { InventoryCorrectionComponent } from './inventory-correction/inventory-correction.component';
import { InventoryUnloadComponent } from './inventory-unload/inventory-unload.component';

@NgModule({
  declarations: [
    AppComponent,
    PartnersComponent,
    StoragesComponent,
    PartnerDetailComponent,
    PartnerDetailsStockComponent,
    PartnerDetailsStockHistoryComponent,
    PartnerNewComponent,
    InventoryComponent,
    InventoryHistoryComponent,
    LoadComponent,
    TabDirective,
    UnloadComponent,
    StorageCreateComponent,
    DialogMessageComponent,
    InventoryCorrectionComponent,
    InventoryUnloadComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    FlexLayoutModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
