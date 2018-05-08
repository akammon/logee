const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const url = require('url');
const Tail = require('./lib/tail.js');

let win;
let logWin;

  function createWindow () {

    win = new BrowserWindow({width: 800, height: 600});

    win.loadURL(url.format({
      pathname: path.join(__dirname, '/html/index.html'),
      protocol: 'file:',
      slashes: true
    }));
    
    win.webContents.on('did-finish-load', () => {

      
      const tool = new Tail('server.log', 0);
      tool.tail();
      tool.on('log', (log) => {
        //console.log(log);
        win.webContents.send('inbound:log', log);
      });
    });

    
  }

  ipcMain.on('log:selected', (event, message) => {
    logWin = new BrowserWindow({width: 300, height: 150});
    
    logWin.loadURL(url.format({
      pathname: path.join(__dirname, '/html/log.html'),
      protocol: 'file:',
      slashes: true
    }));

    logWin.webContents.on('did-finish-load', () =>{
      console.log(message);
      logWin.webContents.send('log:selected', message);
    }); 
  });

  app.on('ready', createWindow);




