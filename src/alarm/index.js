import alarmState from './alarmState';
import { deviceManagement, ylDeviceManagement } from '../api-service/api/deviceManagements';
import { getSystemInfo } from '../utils/systemInfo';


class AlarmReporter {
  constructor() {
    this.alarmStates = alarmState;
    getSystemInfo().then((systemInfo) => {
      this.clientId = systemInfo.clientId;
    });
  }

  report(state) {
    // deviceManagement.reportAlarm(clientId, this.alarmStates[state]);
    ylDeviceManagement.reportAlarm(this.clientId, this.alarmStates[state]);
  }
}

export default new AlarmReporter();
