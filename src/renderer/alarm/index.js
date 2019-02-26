import { ipcRenderer } from 'electron';
import alarmState from './alarmState';
import { deviceManagements } from '../service';

const { deviceManagement, ylDeviceManagement } = deviceManagements;


class AlarmReporter {
  constructor(clientId) {
    this.clientId = clientId;
    this.alarmStates = alarmState;

    ipcRenderer.on('gpu-process-crashed', ({ event, killed }) => {

    });
    ipcRenderer.on('crashed', ({ event, killed }) => {
      deviceManagement.reportAlarm(this.clientId);
      ylDeviceManagement.reportAlarm(this.clientId);
    });
  }

  report(data) {
    deviceManagement.reportAlarm(this.clientId);
    ylDeviceManagement.reportAlarm(this.clientId);
  }
}

export default new AlarmReporter();
