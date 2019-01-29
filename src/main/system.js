import { ipcMain } from 'electron';
import system from '../utils/systemInfo';

ipcMain.on('request-system-info', async(event, arg) => {
  const data = await system();

  event.sender.send('system-info', data);
});
