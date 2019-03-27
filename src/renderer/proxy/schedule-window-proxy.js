import { ipcRenderer } from 'electron';

let startTime = 0;

export const ScheduleWindowProxy = {
  beforeCreate() {
    startTime = performance.now();
  },
  mounted() {
    ipcRenderer.send('schedule-ready', performance.now() - startTime);
  },
};
