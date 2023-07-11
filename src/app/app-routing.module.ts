import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PartnersComponent } from './partners/partners.component';
import { StoragesComponent } from './storages/storages.component';
import { InventoryComponent } from './inventory/inventory.component';
import { InventoryHistoryComponent } from './inventory-history/inventory-history.component';
import { LoadComponent } from './load/load.component';
import { UnloadComponent } from './unload/unload.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'inventory'},
  { path: 'partners', component: PartnersComponent },
  { path: 'storages', component: StoragesComponent },
  { path: 'inventory', component: InventoryComponent },
  { path: 'inventory-history', component: InventoryHistoryComponent },
  { path: 'load', component: LoadComponent },
  { path: 'unload', component: UnloadComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
