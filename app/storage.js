"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqliteStorage = void 0;
var sqlite3 = require('sqlite3');
var uuid = require('uuid');
var SqliteStorage = /** @class */ (function () {
    function SqliteStorage(connectionString) {
        this.connectionString = connectionString;
    }
    SqliteStorage.prototype.itemSafeInsert = function (data) {
        var query = 'SELECT "id", "name" FROM "item" WHERE "name" = ?';
        var params = [data.name];
        var db = this.createdb();
        return new Promise(function (resolve, reject) {
            db.get(query, params, function (err, row) {
                if (err) {
                    reject(err);
                    return;
                }
                if (row) {
                    resolve(row.id);
                    return;
                }
                var timestamp = new Date().getTime();
                var insert_params = [data.name, timestamp];
                var insert_command = 'INSERT INTO "item" ("name", "created") VALUES (?, ?);';
                db.run(insert_command, insert_params, function (err) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(this.lastID);
                    }
                });
                db.close();
            });
        });
    };
    SqliteStorage.prototype.stockGet = function (id) {
        var query = 'SELECT s."id", s."pallets", s."quantity", s."empties", s."created", s."updated", s."item_id", i."name" as "item_name", s."location_id", l."name" as "location_name", s."partner_id", p."name" as "partner_name" FROM "stock" as s LEFT JOIN "item" as i ON i."id" = s."item_id" LEFT JOIN "location" as l ON l."id" = s."location_id" LEFT JOIN "partner" as p ON p."id" = s."partner_id"';
        var params = [];
        var filters = [];
        filters.push('s."id" = ?');
        params.push(id);
        return this.filterQueryGet(query, params, filters, []);
    };
    SqliteStorage.prototype.stockCorrection = function (data) {
        var stock_get_command = 'SELECT s."id", s."pallets", s."quantity", s."empties", s."created", s."updated", s."item_id", i."name" as "item_name", s."location_id", l."name" as "location_name", s."partner_id", p."name" as "partner_name" FROM "stock" as s LEFT JOIN "item" as i ON i."id" = s."item_id" LEFT JOIN "location" as l ON l."id" = s."location_id" LEFT JOIN "partner" as p ON p."id" = s."partner_id" WHERE s."id" = ?';
        var history_insert_command = 'INSERT INTO "history" ( "item_id", "item_name", "partner_id", "partner_name", "location_id", "location_name", "operation", "comment", "pallets", "quantity", "empties", "created", "group", "type" ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        var stock_update_command = 'UPDATE "stock" SET "pallets" = ?, "quantity" = ?, "empties" = ?, "updated" = ? WHERE "id" = ?';
        var timestamp = new Date().getTime();
        var groupid = uuid.v4();
        var db = this.createdb();
        return new Promise(function (resolve, reject) {
            db.serialize(function () {
                db.get(stock_get_command, [data.stock_id], function (err, row) {
                    var params1 = [row.item_id, row.item_name, row.partner_id, row.partner_name, row.location_id, row.location_name, data.operation, data.comment, data.pallets, data.quantity, data.empties, timestamp, groupid, data.type];
                    var params2 = [data.pallets, data.quantity, data.empties, timestamp, data.stock_id];
                    var rollback = function () {
                        db.run('ROLLBACK', function (err) {
                            reject();
                        });
                    };
                    db.run('BEGIN', function (err1) {
                        if (err1) {
                            rollback();
                            return;
                        }
                        db.run(history_insert_command, params1, function (err2) {
                            if (err2) {
                                rollback();
                                return;
                            }
                            db.run(stock_update_command, params2, function (err3) {
                                if (err3) {
                                    rollback();
                                    return;
                                }
                                db.run('COMMIT', function (err4) {
                                    resolve(1);
                                });
                            });
                        });
                    });
                });
            });
        });
    };
    SqliteStorage.prototype.load = function (data) {
        var history_insert_command = 'INSERT INTO "history" ( "item_id", "item_name", "partner_id", "partner_name", "location_id", "location_name", "operation", "comment", "pallets", "quantity", "empties", "created", "group", "type" ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        var stock_insert_command = 'INSERT INTO "stock" ( "item_id", "partner_id", "location_id", "pallets", "quantity", "empties", "created", "updated" ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        var timestamp = new Date().getTime();
        var groupid = uuid.v4();
        var db = this.createdb();
        var cursor = 0;
        return new Promise(function (resolve, reject) {
            db.serialize(function () {
                var catchFunction = function (err) {
                    if (err) {
                        db.run('ROLLBACK', function (err2) {
                            db.close();
                            reject(err);
                        });
                    }
                    else if (cursor < data.length) {
                        var current = data[cursor++];
                        var params = [current.item_id, current.item_name, current.partner_id, current.partner_name, current.location_id, current.location_name, current.operation, current.comment, current.pallets, current.quantity, current.empties, timestamp, groupid, current.type];
                        db.run(history_insert_command, params, function (err) {
                            if (err) {
                                db.run('ROLLBACK', function (err2) {
                                    db.close();
                                    reject(err);
                                });
                            }
                            else {
                                db.run(stock_insert_command, [current.item_id, current.partner_id, current.location_id, current.pallets, current.quantity, current.empties, timestamp, timestamp], catchFunction);
                            }
                        });
                    }
                    else {
                        db.run('COMMIT', function (err2) {
                            db.close();
                            resolve(groupid);
                        });
                    }
                };
                db.run('BEGIN', catchFunction);
            });
        });
    };
    SqliteStorage.prototype.reportHistory = function (filter) {
        var query = 'SELECT h."id", h."item_id", h."item_name", h."pallets", h."quantity", h."empties", h."location_id", h."location_name", h."partner_id", h."partner_name", h."created", h."operation", h."comment", h."type" FROM "history" as h';
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
        return this.filterQueryAll(query, params, filters, ['h.created DESC']);
    };
    SqliteStorage.prototype.reportHistoryByGroup = function (id) {
        var query = 'SELECT h."id", h."item_id", h."item_name", h."pallets", h."quantity", h."empties", h."location_id", h."location_name", h."partner_id", h."partner_name", h."created", h."operation", h."comment", h."type" FROM "history" as h';
        var params = [];
        var filters = [];
        filters.push('h."group" = ?');
        params.push(id);
        return this.filterQueryAll(query, params, filters, ['h."id"']);
    };
    SqliteStorage.prototype.reportStock = function (filter) {
        var query = 'SELECT s."id", s."pallets", s."quantity", s."empties", s."created", s."updated", s."item_id", i."name" as "item_name", s."location_id", l."name" as "location_name", s."partner_id", p."name" as "partner_name" FROM "stock" as s LEFT JOIN "item" as i ON i."id" = s."item_id" LEFT JOIN "location" as l ON l."id" = s."location_id" LEFT JOIN "partner" as p ON p."id" = s."partner_id"';
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
        return this.filterQueryAll(query, params, filters, []);
    };
    SqliteStorage.prototype.itemLookup = function () {
        var query = 'SELECT "id", "name" FROM "item"';
        return this.simpleQueryAll(query);
    };
    SqliteStorage.prototype.itemCreate = function (data) {
        var name = this.falseAsNull(data.name);
        var timestamp = new Date().getTime();
        var params = [name, timestamp];
        var query = 'INSERT INTO "item" ("name", "created") VALUES (?, ?);';
        return this.simpleInsert(query, params);
    };
    SqliteStorage.prototype.locationDelete = function (id) {
        var params = [id];
        var query = 'DELETE FROM "location" WHERE "id" = ?;';
        return this.simpleDelete(query, params);
    };
    SqliteStorage.prototype.locationGet = function (id) {
        var query = 'SELECT "id", "parent_id", "name", "created", "updated" FROM "location" WHERE "id" = ?';
        var params = [id];
        return this.simpleQueryGet(query, params);
    };
    SqliteStorage.prototype.locationLookup = function () {
        var query = 'SELECT "id", "name" FROM "location"';
        return this.simpleQueryAll(query);
    };
    SqliteStorage.prototype.locationCreate = function (data) {
        var name = this.falseAsNull(data.name);
        var parent_id = this.falseAsNull(data.parent_id);
        var timestamp = new Date().getTime();
        var params = [name, parent_id, timestamp, timestamp];
        var query = 'INSERT INTO "location" ("name", "parent_id", "created", "updated") VALUES (?, ?, ?, ?);';
        return this.simpleInsert(query, params);
    };
    SqliteStorage.prototype.locationRename = function (data) {
        var id = data.id;
        var name = this.falseAsNull(data.name);
        var timestamp = new Date().getTime();
        var params = [name, timestamp, id];
        var query = 'UPDATE "location" SET "name" = ?, "updated" = ? WHERE "id" = ?;';
        return this.simpleUpdate(query, params);
    };
    SqliteStorage.prototype.locationList = function () {
        var query = 'SELECT "id", "parent_id", "name", "created", "updated" FROM "location"';
        return this.simpleQueryAll(query);
    };
    SqliteStorage.prototype.reportPartnerStock = function (id) {
        var params = [id];
        var query = 'SELECT s."id", i."id" as "item_id", i."name" as "item_name", s."pallets", s."quantity", s."empties", l."id" as "location_id", l."name" as "location_name", s."updated" FROM "stock" as s LEFT JOIN "item" as i ON i."id" = s."item_id" LEFT JOIN "location" as l ON l."id" = s."location_id" WHERE s."partner_id" = ?';
        return this.simpleQueryAll(query, params);
    };
    SqliteStorage.prototype.reportPartnerHistory = function (id) {
        var params = [id];
        var query = 'SELECT h."id", h."item_id", h."item_name", h."pallets", h."quantity", h."empties", h."location_id", h."location_name", h."partner_id", h."partner_name", h."created", h."operation", h."comment", h."type" FROM "history" as h WHERE h."partner_id" = ?';
        return this.simpleQueryAll(query, params);
    };
    SqliteStorage.prototype.partnerGet = function (id) {
        var params = [id];
        var query = 'SELECT "id", "name", "email", "phone", "created", "updated" FROM "partner" WHERE id = ?';
        return this.simpleQueryGet(query, params);
    };
    SqliteStorage.prototype.partnerUpdate = function (data) {
        var id = data.id;
        var name = this.falseAsNull(data.name);
        var email = this.falseAsNull(data.email);
        var phone = this.falseAsNull(data.phone);
        var timestamp = new Date().getTime();
        var params = [name, email, phone, timestamp, id];
        var query = 'UPDATE "partner" SET "name" = ?, "email" = ?, "phone" = ?, "updated" = ? WHERE "id" = ?;';
        return this.simpleUpdate(query, params);
    };
    SqliteStorage.prototype.partnerCreate = function (data) {
        var name = this.falseAsNull(data.name);
        var email = this.falseAsNull(data.email);
        var phone = this.falseAsNull(data.phone);
        var timestamp = new Date().getTime();
        var params = [name, email, phone, timestamp, timestamp];
        var query = 'INSERT INTO "partner" ("name", "email", "phone", "created", "updated") VALUES (?, ?, ?, ?, ?);';
        return this.simpleInsert(query, params);
    };
    SqliteStorage.prototype.reportPartnerList = function () {
        var query = 'SELECT p."id" AS "partner_id", p."name" as "partner_name", p."email" as "partner_email", p."phone" as "partner_phone", p."created", p."updated", ifnull(s."pallets", 0) as "pallets", ifnull(s."quantity", 0) as "quantity", ifnull(s."empties", 0) as "empties" FROM "partner" as p LEFT JOIN (SELECT "partner_id", SUM("pallets") as "pallets", SUM("quantity") as "quantity", SUM("empties") as "empties" FROM "stock" GROUP BY "partner_id") AS s ON s."partner_id" = p."id"';
        return this.simpleQueryAll(query);
    };
    SqliteStorage.prototype.partnerLookup = function () {
        var query = 'SELECT "id", "name" FROM "partner"';
        return this.simpleQueryAll(query);
    };
    SqliteStorage.prototype.createdb = function () {
        var db = new sqlite3.Database(this.connectionString);
        db.get("PRAGMA foreign_keys = ON");
        db.on('trace', function (x) {
            console.log(x);
        });
        return db;
    };
    SqliteStorage.prototype.filterQueryGet = function (query, params, filters, orders) {
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
        return new Promise(function (resolve, reject) {
            db.serialize(function () {
                db.get(query, params, function (err, row) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(row);
                    }
                });
                db.close();
            });
        });
    };
    SqliteStorage.prototype.filterQueryAll = function (query, params, filters, orders) {
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
        return new Promise(function (resolve, reject) {
            db.serialize(function () {
                db.all(query, params, function (err, rows) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(rows);
                    }
                });
                db.close();
            });
        });
    };
    SqliteStorage.prototype.simpleQueryAll = function (query, params) {
        var db = this.createdb();
        return new Promise(function (resolve, reject) {
            db.serialize(function () {
                db.all(query, params, function (err, rows) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(rows);
                    }
                });
                db.close();
            });
        });
    };
    SqliteStorage.prototype.simpleQueryGet = function (query, params) {
        var db = this.createdb();
        return new Promise(function (resolve, reject) {
            db.serialize(function () {
                db.get(query, params, function (err, row) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(row);
                    }
                });
                db.close();
            });
        });
    };
    SqliteStorage.prototype.simpleInsert = function (query, params) {
        var db = this.createdb();
        return new Promise(function (resolve, reject) {
            db.serialize(function () {
                db.run(query, params, function (err) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(this.lastID);
                    }
                });
                db.close();
            });
        });
    };
    SqliteStorage.prototype.simpleUpdate = function (query, params) {
        var db = this.createdb();
        return new Promise(function (resolve, reject) {
            db.serialize(function () {
                db.run(query, params, function (err) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(this.changes);
                    }
                });
                db.close();
            });
        });
    };
    SqliteStorage.prototype.simpleDelete = function (query, params) {
        var db = this.createdb();
        return new Promise(function (resolve, reject) {
            db.serialize(function () {
                db.run(query, params, function (err) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(this.changes);
                    }
                });
                db.close();
            });
        });
    };
    SqliteStorage.prototype.runAsync = function (db, query, params) {
        return new Promise(function (resolve, reject) {
            db.run(query, params, function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve([this.lastId, this.changes]);
                }
            });
        });
    };
    SqliteStorage.prototype.falseAsNull = function (value) {
        return (value ? value : null);
    };
    return SqliteStorage;
}());
exports.SqliteStorage = SqliteStorage;
;
//# sourceMappingURL=storage.js.map