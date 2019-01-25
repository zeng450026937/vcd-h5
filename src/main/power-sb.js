/* eslint-disable import/no-extraneous-dependencies */
import { app, powerSaveBlocker } from 'electron';

let blocker;

app.on('ready', () => {
  blocker = powerSaveBlocker.start('prevent-app-suspension');
});

app.on('quit', () => {
  if (blocker && powerSaveBlocker.isStarted(blocker)) {
    powerSaveBlocker.stop(blocker);
  }
});
