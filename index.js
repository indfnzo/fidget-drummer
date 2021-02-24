const path = require('path');
const child_process = require('child_process');
const { app, BrowserWindow } = require('electron');

// Make sure we're not running another instance.
// This potentially prevents an issue with iohook interfering with the system
// when multiple instances are started at the same time.
// See: https://github.com/wilix-team/iohook/issues/93
const lock = app.requestSingleInstanceLock();
if (!lock) {
    console.error('Duplicate instance detected. Aborting launch.');
    process.exit(-1);
}

// enable Electron watch reload
require('electron-reload')(__dirname, {
    electron: path.resolve(__dirname, 'node_modules', '.bin', 'electron.cmd')
});

let mainWindow = null;

const createMainWindow = () => {
    mainWindow = new BrowserWindow({
        title: 'Fidget Drummer',
        backgroundColor: '#1E2330',
        width: 524,
        minWidth: 277,
        maxWidth: 524,
        height: 800,
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true
        },
        autoHideMenuBar: true,
        icon: 'public/favicon.ico'
    });

    mainWindow.loadFile('public/index.html');

    // Fork an iohook process to workaround a specific Chromium issue.
    // See: https://github.com/wilix-team/iohook/issues/230
    const iohookProcess = child_process.fork(path.resolve(__dirname, 'iohook.js'), { silent: true });

    iohookProcess.on('message', evt => {
        mainWindow.webContents.send(evt.type, evt.data);
    });

    mainWindow.on('closed', () => {
        iohookProcess.kill();
    });
};

app.whenReady().then(createMainWindow);
app.on('window-all-closed', () => app.quit());
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow()
    }
});
