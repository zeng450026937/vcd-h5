/* eslint-disable import/no-extraneous-dependencies */
import { app } from 'electron';

// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  event.preventDefault();
  callback(true);
});

app.on('select-client-certificate', (event, webContents, url, list, callback) => {
  event.preventDefault();
  callback(list[0]);
});
