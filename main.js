const { app, BrowserWindow, ipcMain, globalShortcut } = require("electron");

let mainWindow;
let store;

// Dynamically import electron-store and initialize the store after import
import("electron-store")
  .then((ElectronStore) => {
    store = new ElectronStore.default(); // Ensure that you are accessing the default export correctly

    app.whenReady().then(createWindow);
  })
  .catch((e) => {
    console.error("Failed to load electron-store:", e);
  });

function createWindow() {
  app.setName("Vivant VoIP");

  mainWindow = new BrowserWindow({
    width: 345,
    height: 605,
    icon: __dirname + "/assets/images/pbx.icns",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    resizable: false,
    fullscreenable: false,
  });

  // Load setup wizard or main app depending on whether subdomain is configured
  // store.clear();
  const subdomain = store.get("subdomain");
  if (!subdomain) {
    mainWindow.loadURL("file://" + __dirname + "/setup.html");
  } else {
    mainWindow.loadURL("file://" + __dirname + "/index.html");

    // Send subdomain info to the renderer process
    mainWindow.webContents.on("did-finish-load", () => {
      mainWindow.webContents.send("set-subdomain", subdomain);
    });
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  globalShortcut.register("CommandOrControl+D", () => {
    mainWindow.webContents.send("reset-setup", {});
    store.clear();
  });
}

ipcMain.on("configure-subdomain", (event, subdomain) => {
  store.set("subdomain", subdomain);
  mainWindow.loadURL("file://" + __dirname + "/index.html");

  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.webContents.send("set-subdomain", subdomain);
  });
});

ipcMain.on("reset-setup-done", () => {
  mainWindow.loadURL("file://" + __dirname + "/setup.html");
});

// Ensure the app is the default client for 'tel' links
app.setAsDefaultProtocolClient("tel");

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on("open-url", (event, url) => {
  event.preventDefault();
  const phoneNumber = url.split(":")[1];
  mainWindow.webContents.send("doDial", phoneNumber);
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.focus();
});
