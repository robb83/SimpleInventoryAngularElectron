import { app, BrowserWindow, screen, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as url from 'url';
import { SqliteStorage } from './storage';
import { PdfDocumentServices } from './document';

let win: BrowserWindow | null = null;
let storage:SqliteStorage | null = null;
let document:PdfDocumentServices | null = null;

const args = process.argv.slice(1);
const serve = args.some(val => val === '--serve');

function createPrintWindow(): BrowserWindow {
  var print_window = new BrowserWindow({
    width: 1600, height: 900, 
    minWidth: 1024, minHeight: 768,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: (serve) ? true : false,
      contextIsolation: false,  // false if you want to run e2e test with Spectron
    },
  });
  print_window.removeMenu();

  if (serve) {
    print_window.loadURL('http://localhost:4200');
  } else {
    // Path when running electron executable
    let pathIndex = './index.html';

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

function createWindow(): BrowserWindow {

  // Create the browser window.
  win = new BrowserWindow({
    width: 1600, height: 900, 
    minWidth: 1024, minHeight: 768,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: (serve) ? true : false,
      contextIsolation: false,  // false if you want to run e2e test with Spectron
    },
  });
  win.removeMenu();

  if (serve) {
    win.webContents.openDevTools({ mode: 'undocked' });
    require('electron-reload')(__dirname, {
      electron: require(path.join(__dirname, '/../node_modules/electron'))
    });
    win.loadURL('http://localhost:4200');
  } else {
    // Path when running electron executable
    let pathIndex = './index.html';

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
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  ipcMain.handle("print-pdf", async (event: any, ...args: any[]) => {
    win?.webContents.printToPDF({
      pageSize: 'A4',
      landscape: false,
      marginsType: 2,
    }).then(data => {
      fs.writeFile('test.pdf', data, (error) => {
        if (error) throw error
        console.log(`Wrote PDF successfully to test.pdf`)
      })
    }).catch(error => {
      console.log(`Failed to write PDF to test.pdf: `, error)
    })
  });
  
  ipcMain.handle("document-load-generate", async (event: any, ...args: any[]) => {
    return document?.generateLoad(args[0]);
  });

  ipcMain.handle("storage-item-safe-insert", async (event: any, ...args: any[]) => {
    return storage?.itemSafeInsert(args[0]);
  });

  ipcMain.handle("storage-stock-get", async (event: any, ...args: any[]) => {
    return storage?.stockGet(args[0]);
  });

  ipcMain.handle("storage-stock-correction", async (event: any, ...args: any[]) => {
    return storage?.stockCorrection(args[0]);
  });

  ipcMain.handle("storage-load", async (event: any, ...args: any[]) => {
    return storage?.load(args[0]);
  });

  ipcMain.handle("storage-report-history", async (event: any, ...args: any[]) => {
    return storage?.reportHistory(args[0]);
  });
  
  ipcMain.handle("storage-report-stock", async (event: any, ...args: any[]) => {
    return storage?.reportStock(args[0]);
  });

  ipcMain.handle("storage-item-lookup", async (event: any, ...args: any[]) => {
    return storage?.itemLookup();
  });
  
  ipcMain.handle("storage-item-create", async (event: any, ...args: any[]) => {
    return storage?.itemCreate(args[0]);
  });
  
  ipcMain.handle("storage-location-delete", async (event: any, ...args: any[]) => {
    return storage?.locationDelete(args[0]);
  });

  ipcMain.handle("storage-location-get", async (event: any, ...args: any[]) => {
    return storage?.locationGet(args[0]);
  });

  ipcMain.handle("storage-location-lookup", async (event: any, ...args: any[]) => {
    return storage?.locationLookup();
  });

  ipcMain.handle("storage-location-list", async (event: any, ...args: any[]) => {
    return storage?.locationList();
  });

  ipcMain.handle("storage-location-create", async (event: any, ...args: any[]) => {
    return storage?.locationCreate(args[0]);
  });

  ipcMain.handle("storage-location-rename", async (event: any, ...args: any[]) => {
    return storage?.locationRename(args[0]);
  });

  ipcMain.handle("storage-partner-lookup", async (event: any, ...args: any[]) => {
    return storage?.partnerLookup();
  });

  ipcMain.handle("storage-partner-get", async (event: any, ...args: any[]) => {
    return storage?.partnerGet(args[0]);
  });

  ipcMain.handle("storage-partner-create", async (event: any, ...args: any[]) => {
    return storage?.partnerCreate(args[0]);
  });

  ipcMain.handle("storage-partner-update", async (event: any, ...args: any[]) => {
    return storage?.partnerUpdate(args[0]);
  });

  ipcMain.handle("storage-report-partner-list", async (event: any, ...args: any[]) => {
    return storage?.reportPartnerList();
  });

  ipcMain.handle("storage-report-partner-stock", async (event: any, ...args: any[]) => {
    return storage?.reportPartnerStock(args[0]);
  });

  ipcMain.handle("storage-report-partner-history", async (event: any, ...args: any[]) => {
    return storage?.reportPartnerHistory(args[0]);
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
  var application_data_path = app.getPath('userData');
  var application_storage_path = path.join(application_data_path, dbname);
  var application_document_storage_path = path.join(application_data_path, 'documents');

  console.log(application_data_path);
  console.log(application_storage_path);
  console.log(application_document_storage_path);

  if (!fs.existsSync(application_data_path)) fs.mkdirSync(application_data_path);
  if (!fs.existsSync(application_storage_path)) fs.copyFileSync(path.join(app.getAppPath(), '../../storage.db'), application_storage_path);  
  if (!fs.existsSync(application_document_storage_path)) fs.mkdirSync(application_document_storage_path)

  storage = new SqliteStorage(application_storage_path);
  document = new PdfDocumentServices(storage, application_document_storage_path);

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => setTimeout(createWindow, 400));

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}
