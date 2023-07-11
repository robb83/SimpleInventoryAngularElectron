"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var path = require("path");
var fs = require("fs");
var url = require("url");
var storage_1 = require("./storage");
var document_1 = require("./document");
var win = null;
var storage = null;
var document = null;
var args = process.argv.slice(1);
var serve = args.some(function (val) { return val === '--serve'; });
function createPrintWindow() {
    var print_window = new electron_1.BrowserWindow({
        width: 1600, height: 900,
        minWidth: 1024, minHeight: 768,
        webPreferences: {
            nodeIntegration: true,
            allowRunningInsecureContent: (serve) ? true : false,
            contextIsolation: false, // false if you want to run e2e test with Spectron
        },
    });
    print_window.removeMenu();
    if (serve) {
        print_window.loadURL('http://localhost:4200');
    }
    else {
        // Path when running electron executable
        var pathIndex = './index.html';
        if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
            // Path when running electron in local folder
            pathIndex = '../dist/index.html';
        }
        print_window.loadURL(url.format({
            pathname: path.join(__dirname, pathIndex),
            protocol: 'file:',
            slashes: true
        }));
    }
    return print_window;
}
function createWindow() {
    var _this = this;
    // Create the browser window.
    win = new electron_1.BrowserWindow({
        width: 1600, height: 900,
        minWidth: 1024, minHeight: 768,
        webPreferences: {
            nodeIntegration: true,
            allowRunningInsecureContent: (serve) ? true : false,
            contextIsolation: false, // false if you want to run e2e test with Spectron
        },
    });
    win.removeMenu();
    if (serve) {
        win.webContents.openDevTools({ mode: 'undocked' });
        require('electron-reload')(__dirname, {
            electron: require(path.join(__dirname, '/../node_modules/electron'))
        });
        win.loadURL('http://localhost:4200');
    }
    else {
        // Path when running electron executable
        var pathIndex = './index.html';
        if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
            // Path when running electron in local folder
            pathIndex = '../dist/index.html';
        }
        win.loadURL(url.format({
            pathname: path.join(__dirname, pathIndex),
            protocol: 'file:',
            slashes: true
        }));
    }
    // Emitted when the window is closed.
    win.on('closed', function () {
        // Dereference the window object, usually you would store window
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });
    electron_1.ipcMain.handle("print-pdf", function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                win === null || win === void 0 ? void 0 : win.webContents.printToPDF({
                    pageSize: 'A4',
                    landscape: false,
                    marginsType: 2,
                }).then(function (data) {
                    fs.writeFile('test.pdf', data, function (error) {
                        if (error)
                            throw error;
                        console.log("Wrote PDF successfully to test.pdf");
                    });
                }).catch(function (error) {
                    console.log("Failed to write PDF to test.pdf: ", error);
                });
                return [2 /*return*/];
            });
        });
    });
    electron_1.ipcMain.handle("document-load-generate", function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, document === null || document === void 0 ? void 0 : document.generateLoad(args[0])];
            });
        });
    });
    electron_1.ipcMain.handle("storage-item-safe-insert", function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, storage === null || storage === void 0 ? void 0 : storage.itemSafeInsert(args[0])];
            });
        });
    });
    electron_1.ipcMain.handle("storage-stock-get", function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, storage === null || storage === void 0 ? void 0 : storage.stockGet(args[0])];
            });
        });
    });
    electron_1.ipcMain.handle("storage-stock-correction", function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, storage === null || storage === void 0 ? void 0 : storage.stockCorrection(args[0])];
            });
        });
    });
    electron_1.ipcMain.handle("storage-load", function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, storage === null || storage === void 0 ? void 0 : storage.load(args[0])];
            });
        });
    });
    electron_1.ipcMain.handle("storage-report-history", function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, storage === null || storage === void 0 ? void 0 : storage.reportHistory(args[0])];
            });
        });
    });
    electron_1.ipcMain.handle("storage-report-stock", function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, storage === null || storage === void 0 ? void 0 : storage.reportStock(args[0])];
            });
        });
    });
    electron_1.ipcMain.handle("storage-item-lookup", function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, storage === null || storage === void 0 ? void 0 : storage.itemLookup()];
            });
        });
    });
    electron_1.ipcMain.handle("storage-item-create", function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, storage === null || storage === void 0 ? void 0 : storage.itemCreate(args[0])];
            });
        });
    });
    electron_1.ipcMain.handle("storage-location-delete", function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, storage === null || storage === void 0 ? void 0 : storage.locationDelete(args[0])];
            });
        });
    });
    electron_1.ipcMain.handle("storage-location-get", function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, storage === null || storage === void 0 ? void 0 : storage.locationGet(args[0])];
            });
        });
    });
    electron_1.ipcMain.handle("storage-location-lookup", function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, storage === null || storage === void 0 ? void 0 : storage.locationLookup()];
            });
        });
    });
    electron_1.ipcMain.handle("storage-location-list", function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, storage === null || storage === void 0 ? void 0 : storage.locationList()];
            });
        });
    });
    electron_1.ipcMain.handle("storage-location-create", function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, storage === null || storage === void 0 ? void 0 : storage.locationCreate(args[0])];
            });
        });
    });
    electron_1.ipcMain.handle("storage-location-rename", function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, storage === null || storage === void 0 ? void 0 : storage.locationRename(args[0])];
            });
        });
    });
    electron_1.ipcMain.handle("storage-partner-lookup", function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, storage === null || storage === void 0 ? void 0 : storage.partnerLookup()];
            });
        });
    });
    electron_1.ipcMain.handle("storage-partner-get", function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, storage === null || storage === void 0 ? void 0 : storage.partnerGet(args[0])];
            });
        });
    });
    electron_1.ipcMain.handle("storage-partner-create", function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, storage === null || storage === void 0 ? void 0 : storage.partnerCreate(args[0])];
            });
        });
    });
    electron_1.ipcMain.handle("storage-partner-update", function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, storage === null || storage === void 0 ? void 0 : storage.partnerUpdate(args[0])];
            });
        });
    });
    electron_1.ipcMain.handle("storage-report-partner-list", function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, storage === null || storage === void 0 ? void 0 : storage.reportPartnerList()];
            });
        });
    });
    electron_1.ipcMain.handle("storage-report-partner-stock", function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, storage === null || storage === void 0 ? void 0 : storage.reportPartnerStock(args[0])];
            });
        });
    });
    electron_1.ipcMain.handle("storage-report-partner-history", function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, storage === null || storage === void 0 ? void 0 : storage.reportPartnerHistory(args[0])];
            });
        });
    });
    return win;
}
try {
    // console.log(app.getAppPath());
    // console.log(app.getPath('userData'));
    // console.log(app.getPath('appData'));
    // console.log(app.getPath('exe'));
    // var data = '';
    // data += 'appPath = '; data += app.getAppPath(); data += '\n';
    // data += 'userPath = '; data += app.getPath('userData'); data += '\n';
    // data += 'appData = '; data += app.getPath('appData'); data += '\n';
    // data += 'exe = '; data += app.getPath('exe'); data += '\n';
    // fs.writeFileSync("d:\alma.log", data);
    var dbname = 'storage.db';
    var application_data_path = electron_1.app.getPath('userData');
    var application_storage_path = path.join(application_data_path, dbname);
    var application_document_storage_path = path.join(application_data_path, 'documents');
    console.log(application_data_path);
    console.log(application_storage_path);
    console.log(application_document_storage_path);
    if (!fs.existsSync(application_data_path))
        fs.mkdirSync(application_data_path);
    if (!fs.existsSync(application_storage_path))
        fs.copyFileSync(path.join(electron_1.app.getAppPath(), '../../storage.db'), application_storage_path);
    if (!fs.existsSync(application_document_storage_path))
        fs.mkdirSync(application_document_storage_path);
    storage = new storage_1.SqliteStorage(application_storage_path);
    document = new document_1.PdfDocumentServices(storage, application_document_storage_path);
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
    electron_1.app.on('ready', function () { return setTimeout(createWindow, 400); });
    // Quit when all windows are closed.
    electron_1.app.on('window-all-closed', function () {
        // On OS X it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') {
            electron_1.app.quit();
        }
    });
    electron_1.app.on('activate', function () {
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (win === null) {
            createWindow();
        }
    });
}
catch (e) {
    // Catch Error
    // throw e;
}
//# sourceMappingURL=main.js.map