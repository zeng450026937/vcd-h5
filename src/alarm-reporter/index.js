import { get } from 'lodash';
import alarmState from './alarmState';
import { ylDeviceManagement } from '../api-service/api/deviceManagements';
import LogProvider from '../log-provider/provider';


class AlarmReporter extends LogProvider {
  constructor() {
    super();

    this.alarmStates = alarmState;
  }

  report(state) {
    const reportInfo = get(this, `alarmStates${state}`, {
      alarmCode  : '008',
      alarmName  : state,
      alarmLevel : 1,
      alarmType  : state,
      alarmDesc  : state,
    });

    reportInfo.alarmTime = new Date().valueOf();

    const logFormData = this.provideTodayLog();

    logFormData.append('param', reportInfo);

    ylDeviceManagement.reportAlarm(this.clientId, { param: reportInfo }, { headers: logFormData.getHeaders() });
  }
}

export default new AlarmReporter();
