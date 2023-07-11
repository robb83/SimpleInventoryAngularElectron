import { Component, OnInit } from '@angular/core';
import { Observable, Subject, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { StorageCreateComponent } from '../storage-create/storage-create.component'
import { MatDialog } from '@angular/material/dialog';
import { IpcStorageService } from '../ipc-storage.service';
import { LocationEntry } from 'app/interface';
import { DialogMessageComponent } from '../dialog-message/dialog-message.component';

@Component({
  selector: 'app-storages',
  templateUrl: './storages.component.html',
  styleUrls: ['./storages.component.css']
})
export class StoragesComponent implements OnInit {

  public storages: LocationEntry[];
  public rooms: LocationEntry[];
  public shelves: LocationEntry[];
  public selectedStorage?: LocationEntry;
  public selectedRoom?: LocationEntry;
  public selectedShelf?: LocationEntry;
  public locations: LocationEntry[] = [];

  constructor(public dialog: MatDialog, public storage: IpcStorageService) {
    this.storages = [];
    this.rooms = [];
    this.shelves = [];
  }

  ngOnInit(): void {
    var self = this;
    this.storage.locationList().then(function(rows) {
      self.locations = rows;
      self.updateView(0, undefined);
    });
  }

  updateView(level:number, data:LocationEntry | undefined) {

    if (level == 0) {
      this.selectedStorage = data;
      this.selectedRoom = undefined;
      this.selectedShelf = undefined;
    }
    else if (level == 1) {
      //this.selectedStorage = undefined;
      this.selectedRoom = data;
      this.selectedShelf = undefined;
    }
    else if (level == 2) {
      // this.selectedStorage = undefined;
      // this.selectedRoom = undefined;
      this.selectedShelf = data;
    }

    this.storages = this.searchRoot();
    this.rooms = ( this.selectedStorage ? this.searchByParent(this.selectedStorage.id) : [] );
    this.shelves = ( this.selectedRoom ? this.searchByParent(this.selectedRoom.id) : [] );
  }

  deleteEntry(data: any, level:number) {
    var self = this;
    self.storage.locationDelete(data.id).then(function(x: number) {
      self.locations = self.locations.filter(function(value, index, arr) {
        return value.id != data.id;
      });
      self.updateView(level, undefined);
    }).catch(function(err) {
      const dialogRef = self.dialog.open(DialogMessageComponent, {
        data: { title: "Hiba", message: "Törlés nem lehetséges." },
        disableClose: true,
        hasBackdrop: true
      });
    });
  }

  createNew(parent:any, level:number) {

    const dialogRef = this.dialog.open(StorageCreateComponent, {
      minWidth: '252px',
      disableClose: true,
      hasBackdrop: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {

        var entry = {
          name: result,
          parent_id: (parent?.id ? parent.id : null),
        };

        var self = this;
        this.storage.locationCreate(entry).then(function(id) {
          self.storage.locationGet(id).then(function(row) {
            self.locations.push(row);
            self.updateView(level, row);
          });
        });
      }
    });
  }

  storageChanged(a:any) {
    var v = a.option.value;
    this.selectedStorage = v;
    this.selectedRoom = undefined;
    this.selectedShelf = undefined;
    this.rooms = this.searchByParent(v.id);
    this.shelves = [];
  }

  roomChanged(a:any) {
    var v = a.option.value;
    this.selectedRoom = v;
    this.selectedShelf = undefined;
    this.shelves = this.searchByParent(v.id);
  }

  shelfChanged(a:any) {
    this.selectedShelf = a.option.value;
  }

  searchRoot() {
    var result = [];

    for (var i = 0; i < this.locations.length; ++i) {
      if (this.locations[i].parent_id === null) {
        result.push(this.locations[i]);
      }
    }

    return result;
  }
  
  searchByParent(id:any) {
    var result = [];

    for (var i = 0; i < this.locations.length; ++i)
    {
      if (this.locations[i].parent_id === id) {
        result.push(this.locations[i]);
      }
    }

    return result;
  }
}
