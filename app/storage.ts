var sqlite3 = require('sqlite3');
var uuid = require('uuid');

import { group } from "console";
import { StorageBackend, PartnerLookupEntry, ReportPartnerList, PartnerCreateEntry, PartnerUpdateEntry, PartnerEntry, ReportPartnerHistory, ReportPartnerStock, LocationCreateEntry, LocationEntry, LocationLookupEntry, LocationRenameEntry, ItemCreateEntry, ItemLookupEntry, ReportHistoryEntry, ReportStockEntry, ReportHistoryParameters, ReportStockParameters, LoadInputParameters, CorrectionInputParameters } from "./interface";

export class SqliteStorage implements StorageBackend {

    constructor(private connectionString:string) {
    }

    itemSafeInsert(data: ItemCreateEntry): Promise<number> {
        const query = 'SELECT "id", "name" FROM "item" WHERE "name" = ?';
        var params = [ data.name ];

        var db = this.createdb();
        return new Promise<number>((resolve, reject) => {
            db.get(query, params, function(err: any, row: any) {
                if (err) { reject(err); return; }
                if (row) { resolve(row.id); return; }
                
                const timestamp = new Date().getTime();
                const insert_params = [ data.name, timestamp ];
                const insert_command = 'INSERT INTO "item" ("name", "created") VALUES (?, ?);';

                db.run(insert_command, insert_params, function(this:any, err : any) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.lastID);
                    }
                });
                db.close();
            });
        });
    }

    stockGet(id: number): Promise<ReportStockEntry> {
        const query = 'SELECT s."id", s."pallets", s."quantity", s."empties", s."created", s."updated", s."item_id", i."name" as "item_name", s."location_id", l."name" as "location_name", s."partner_id", p."name" as "partner_name" FROM "stock" as s LEFT JOIN "item" as i ON i."id" = s."item_id" LEFT JOIN "location" as l ON l."id" = s."location_id" LEFT JOIN "partner" as p ON p."id" = s."partner_id"';
        var params = [];
        var filters = [];

        filters.push('s."id" = ?');
        params.push(id);

        return this.filterQueryGet<ReportStockEntry>(query, params, filters, []);
    }

    stockCorrection(data: CorrectionInputParameters): Promise<number> {
        const stock_get_command = 'SELECT s."id", s."pallets", s."quantity", s."empties", s."created", s."updated", s."item_id", i."name" as "item_name", s."location_id", l."name" as "location_name", s."partner_id", p."name" as "partner_name" FROM "stock" as s LEFT JOIN "item" as i ON i."id" = s."item_id" LEFT JOIN "location" as l ON l."id" = s."location_id" LEFT JOIN "partner" as p ON p."id" = s."partner_id" WHERE s."id" = ?'
        const history_insert_command = 'INSERT INTO "history" ( "item_id", "item_name", "partner_id", "partner_name", "location_id", "location_name", "operation", "comment", "pallets", "quantity", "empties", "created", "group", "type" ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const stock_update_command = 'UPDATE "stock" SET "pallets" = ?, "quantity" = ?, "empties" = ?, "updated" = ? WHERE "id" = ?';

        const timestamp = new Date().getTime();
        const groupid = uuid.v4();
        var db = this.createdb();

        return new Promise<number>((resolve, reject) => {
            db.serialize(function() {
                
                db.get(stock_get_command, [data.stock_id], function(err: any, row: any) {

                    var params1 = [ row.item_id, row.item_name, row.partner_id, row.partner_name, row.location_id, row.location_name, data.operation, data.comment, data.pallets, data.quantity, data.empties, timestamp, groupid, data.type ];
                    var params2 = [ data.pallets, data.quantity, data.empties, timestamp, data.stock_id ];
                    var rollback = function() {
                        db.run('ROLLBACK', function(err: any) {
                            reject();
                        });
                    };

                    db.run('BEGIN', function(err1: any) {                        
                        if (err1) { rollback(); return; }

                        db.run(history_insert_command, params1, function(err2: any) {
                            if (err2) { rollback(); return; }

                            db.run(stock_update_command, params2, function(err3: any) {
                                if (err3) { rollback(); return; }

                                db.run('COMMIT', function(err4: any) {
                                    resolve(1);
                                });
                            });
                        });
                    });
                });
            });
        });
    }

    load(data: ReportHistoryEntry[]): Promise<string> {
        const history_insert_command = 'INSERT INTO "history" ( "item_id", "item_name", "partner_id", "partner_name", "location_id", "location_name", "operation", "comment", "pallets", "quantity", "empties", "created", "group", "type" ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const stock_insert_command = 'INSERT INTO "stock" ( "item_id", "partner_id", "location_id", "pallets", "quantity", "empties", "created", "updated" ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

        const timestamp = new Date().getTime();
        const groupid = uuid.v4();

        var db = this.createdb();        
        var cursor = 0;

        return new Promise<string>((resolve, reject) => {
            db.serialize(function() {

                var catchFunction = function(err: any) {
                    if (err) {
                        db.run('ROLLBACK', function(err2: any) {
                            db.close();
                            reject(err);
                        });
                    } else if (cursor < data.length) {
                        var current = data[cursor++];
                        var params = [current.item_id, current.item_name, current.partner_id, current.partner_name, current.location_id, current.location_name, current.operation, current.comment, current.pallets, current.quantity, current.empties, timestamp, groupid, current.type ];

                        db.run(history_insert_command, params, function(err: any) {
                            if (err) {
                                db.run('ROLLBACK', function(err2: any) {
                                    db.close();
                                    reject(err);
                                });
                            } else {
                                db.run(stock_insert_command, [current.item_id, current.partner_id, current.location_id, current.pallets, current.quantity, current.empties, timestamp, timestamp ], catchFunction);
                            }
                        });
                    } else {
                        db.run('COMMIT', function(err2: any) {
                            db.close();
                            resolve(groupid);
                        });
                    }
                };

                db.run('BEGIN', catchFunction);
            });
        });
    }

    reportHistory(filter: ReportHistoryParameters): Promise<ReportHistoryEntry[]> {
        const query = 'SELECT h."id", h."item_id", h."item_name", h."pallets", h."quantity", h."empties", h."location_id", h."location_name", h."partner_id", h."partner_name", h."created", h."operation", h."comment", h."type" FROM "history" as h';
        var params = [];
        var filters = [];
        
        if (filter) {
            if (filter.item) {
                filters.push('h."item_name" like ?');
                params.push('%' + filter.item + '%');
            }

            if (filter.location) {
                filters.push('h."location_name" like ?');
                params.push('%' + filter.location + '%');
            }

            if (filter.partner) {
                filters.push('h."partner_name" like ?');
                params.push('%' + filter.partner + '%');
            }

            if (filter.updatedFrom) {
                filters.push('"created" >= ?');
                params.push(filter.updatedFrom);
            }

            if (filter.updatedTo) {
                filters.push('"created" <= ?');
                params.push(filter.updatedTo);
            }

            if (filter.comment) {
                filters.push('h."comment" like ?');
                params.push('%' + filter.comment + '%');
            }

            if (filter.operation) {
                filters.push('h."operation" like ?');
                params.push('%' + filter.operation + '%');
            }
        }

        return this.filterQueryAll<ReportHistoryEntry[]>(query, params, filters, ['h.created DESC']);
    }

    reportHistoryByGroup(id: string): Promise<ReportHistoryEntry[]> {
        const query = 'SELECT h."id", h."item_id", h."item_name", h."pallets", h."quantity", h."empties", h."location_id", h."location_name", h."partner_id", h."partner_name", h."created", h."operation", h."comment", h."type" FROM "history" as h';
        var params = [];
        var filters = [];
        
        filters.push('h."group" = ?');
        params.push(id);

        return this.filterQueryAll<ReportHistoryEntry[]>(query, params, filters, ['h."id"']);
    }

    reportStock(filter: ReportStockParameters): Promise<ReportStockEntry[]> {
        const query = 'SELECT s."id", s."pallets", s."quantity", s."empties", s."created", s."updated", s."item_id", i."name" as "item_name", s."location_id", l."name" as "location_name", s."partner_id", p."name" as "partner_name" FROM "stock" as s LEFT JOIN "item" as i ON i."id" = s."item_id" LEFT JOIN "location" as l ON l."id" = s."location_id" LEFT JOIN "partner" as p ON p."id" = s."partner_id"';
        var params = [];
        var filters = [];

        if (filter) {
            if (filter.item) {
                filters.push('i."name" like ?');
                params.push('%' + filter.item + '%');
            }

            if (filter.location) {
                filters.push('l."name" like ?');
                params.push('%' + filter.location + '%');
            }

            if (filter.partner) {
                filters.push('p."name" like ?');
                params.push('%' + filter.partner + '%');
            }

            if (filter.updatedFrom) {
                filters.push('"updated" >= ?');
                params.push(filter.updatedFrom);
            }

            if (filter.updatedTo) {
                filters.push('"updated" <= ?');
                params.push(filter.updatedTo);
            }
        }

        return this.filterQueryAll<ReportStockEntry[]>(query, params, filters, []);
    }

    itemLookup(): Promise<ItemLookupEntry[]> {
        const query = 'SELECT "id", "name" FROM "item"';

        return this.simpleQueryAll<ItemLookupEntry[]>(query);
    }

    itemCreate(data: ItemCreateEntry): Promise<number> {        
        var name = this.falseAsNull(data.name);
    
        const timestamp = new Date().getTime();
        const params = [ name, timestamp ];
        const query = 'INSERT INTO "item" ("name", "created") VALUES (?, ?);';
    
        return this.simpleInsert(query, params);
    }

    locationDelete(id: number): Promise<number> {

        const params = [ id ];
        const query = 'DELETE FROM "location" WHERE "id" = ?;';
    
        return this.simpleDelete(query, params);
    }

    locationGet(id: number): Promise<LocationEntry> {
        const query = 'SELECT "id", "parent_id", "name", "created", "updated" FROM "location" WHERE "id" = ?';
        const params = [ id ];

        return this.simpleQueryGet(query, params);
    }

    locationLookup(): Promise<LocationLookupEntry[]> {
        const query = 'SELECT "id", "name" FROM "location"';

        return this.simpleQueryAll(query);
    }

    locationCreate(data: LocationCreateEntry): Promise<number> {
        var name = this.falseAsNull(data.name);
        var parent_id = this.falseAsNull(data.parent_id);
    
        const timestamp = new Date().getTime();
        const params = [ name, parent_id, timestamp, timestamp ];
        const query = 'INSERT INTO "location" ("name", "parent_id", "created", "updated") VALUES (?, ?, ?, ?);';
    
        return this.simpleInsert(query, params);
    }

    locationRename(data: LocationRenameEntry): Promise<number> {
        var id = data.id;
        var name = this.falseAsNull(data.name);

        const timestamp = new Date().getTime();
        const params = [ name, timestamp, id ];
        const query = 'UPDATE "location" SET "name" = ?, "updated" = ? WHERE "id" = ?;';
    
        return this.simpleUpdate(query, params);
    }

    locationList(): Promise<LocationEntry[]> {
        const query = 'SELECT "id", "parent_id", "name", "created", "updated" FROM "location"';

        return this.simpleQueryAll(query);
    }

    reportPartnerStock(id: number): Promise<ReportPartnerStock[]> {
        const params = [ id ];
        const query = 'SELECT s."id", i."id" as "item_id", i."name" as "item_name", s."pallets", s."quantity", s."empties", l."id" as "location_id", l."name" as "location_name", s."updated" FROM "stock" as s LEFT JOIN "item" as i ON i."id" = s."item_id" LEFT JOIN "location" as l ON l."id" = s."location_id" WHERE s."partner_id" = ?';

        return this.simpleQueryAll(query, params);
    }

    reportPartnerHistory(id: number): Promise<ReportPartnerHistory[]> {
        const params = [ id ];
        const query = 'SELECT h."id", h."item_id", h."item_name", h."pallets", h."quantity", h."empties", h."location_id", h."location_name", h."partner_id", h."partner_name", h."created", h."operation", h."comment", h."type" FROM "history" as h WHERE h."partner_id" = ?';

        return this.simpleQueryAll(query, params);
    }

    partnerGet(id: number): Promise<PartnerEntry> {
        const params = [ id ];
        const query = 'SELECT "id", "name", "email", "phone", "created", "updated" FROM "partner" WHERE id = ?';

        return this.simpleQueryGet(query, params);
    }

    partnerUpdate(data: PartnerUpdateEntry): Promise<number> {

        var id = data.id;
        var name = this.falseAsNull(data.name);
        var email = this.falseAsNull(data.email);
        var phone = this.falseAsNull(data.phone);

        const timestamp = new Date().getTime();
        const params = [ name, email, phone, timestamp, id ];
        const query = 'UPDATE "partner" SET "name" = ?, "email" = ?, "phone" = ?, "updated" = ? WHERE "id" = ?;';
    
        return this.simpleUpdate(query, params);
    }

    partnerCreate(data: PartnerCreateEntry): Promise<number> {

        var name = this.falseAsNull(data.name);
        var email = this.falseAsNull(data.email);
        var phone = this.falseAsNull(data.phone);
    
        const timestamp = new Date().getTime();
        const params = [ name, email, phone, timestamp, timestamp ];
        const query = 'INSERT INTO "partner" ("name", "email", "phone", "created", "updated") VALUES (?, ?, ?, ?, ?);';
    
        return this.simpleInsert(query, params);
    }

    reportPartnerList(): Promise<ReportPartnerList[]> {
        const query = 'SELECT p."id" AS "partner_id", p."name" as "partner_name", p."email" as "partner_email", p."phone" as "partner_phone", p."created", p."updated", ifnull(s."pallets", 0) as "pallets", ifnull(s."quantity", 0) as "quantity", ifnull(s."empties", 0) as "empties" FROM "partner" as p LEFT JOIN (SELECT "partner_id", SUM("pallets") as "pallets", SUM("quantity") as "quantity", SUM("empties") as "empties" FROM "stock" GROUP BY "partner_id") AS s ON s."partner_id" = p."id"';

        return this.simpleQueryAll(query);
    }

    partnerLookup(): Promise<PartnerLookupEntry[]> {
        const query = 'SELECT "id", "name" FROM "partner"';    

        return this.simpleQueryAll(query);
    }

    createdb() {
        var db = new sqlite3.Database(this.connectionString);
        db.get("PRAGMA foreign_keys = ON");
        db.on('trace', function(x: any) {
            console.log(x);
        });
        return db;
    }

    filterQueryGet<T>(query: string, params: any[], filters: any[], orders: any[]) : Promise<T> {

        if (filters && filters.length > 0) {
            query += " WHERE ";
            query += filters[0];

            for (var f = 1; f < filters.length; ++f) {
                query += " AND ";
                query += filters[f];
            }
        }

        if (orders && orders.length > 0) {
            query += " ORDER BY ";
            query += orders[0];

            for (var o = 1; o < orders.length; ++o) {
                query += ", ";
                query += orders[o];
            }
        }

        var db = this.createdb();
        return new Promise<T>((resolve, reject) => {
            db.serialize(function() {
                db.get(query, params, function(err: any, row: any) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                });
                db.close();
            });
        });
    }

    filterQueryAll<T>(query: string, params: any[], filters: any[], orders: any[]) : Promise<T> {

        if (filters && filters.length > 0) {
            query += " WHERE ";
            query += filters[0];

            for (var f = 1; f < filters.length; ++f) {
                query += " AND ";
                query += filters[f];
            }
        }

        if (orders && orders.length > 0) {
            query += " ORDER BY ";
            query += orders[0];

            for (var o = 1; o < orders.length; ++o) {
                query += ", ";
                query += orders[o];
            }
        }

        var db = this.createdb();
        return new Promise<T>((resolve, reject) => {
            db.serialize(function() {
                db.all(query, params, function(err: any, rows: any) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
                db.close();
            });
        });
    }

    simpleQueryAll<T>(query: string, params?: any[]) : Promise<T> {
        var db = this.createdb();
        return new Promise<T>((resolve, reject) => {
            db.serialize(function() {
                db.all(query, params, function(err: any, rows: any) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
                db.close();
            });
        });
    }

    simpleQueryGet<T>(query: string, params?: any[]) : Promise<T> {
        var db = this.createdb();
        return new Promise<T>((resolve, reject) => {
            db.serialize(function() {
                db.get(query, params, function(err: any, row: any) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                });
                db.close();
            });
        });
    }

    simpleInsert<T>(query: string, params: any[]) {
        var db = this.createdb();

        return new Promise<number>((resolve, reject) => {
            db.serialize(function() {
                db.run(query, params, function(this:any, err : any) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.lastID);
                    }
                });
                db.close();
            });
        });
    }

    simpleUpdate<T>(query: string, params: any[]) {
        var db = this.createdb();

        return new Promise<number>((resolve, reject) => {
            db.serialize(function() {
                db.run(query, params, function(this:any, err : any) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.changes);
                    }
                });
                db.close();
            });
        });
    }

    simpleDelete<T>(query: string, params: any[]) {
        var db = this.createdb();

        return new Promise<number>((resolve, reject) => {
            db.serialize(function() {
                db.run(query, params, function(this:any, err : any) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.changes);
                    }
                });
                db.close();
            });
        });
    }

    runAsync(db: any, query: string, params: any[]) {
        return new Promise(function (resolve, reject) {
            db.run(query, params, function(this:any, err: any) {
                if (err) {
                    reject(err);
                } else {
                    resolve([ this.lastId, this.changes ]);
                }
            });
        });
    }

    falseAsNull(value : any) {
        return (value ? value : null)
    }
};