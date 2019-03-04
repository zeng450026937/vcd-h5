import { get } from 'lodash';
import FormData from 'form-data';
import alarmState from './alarmState';
import { ylDeviceManagement } from '../api-service/api/deviceManagements';
import LogProvider from '../log-provider/provider';


class AlarmReporter extends LogProvider {
  constructor(api) {
    super();

    this.api = api;
    this.alarmStates = alarmState;
  }

  async report(state) {
    const reportInfo = get(this, `alarmStates${state}`, {
      alarmCode  : '008',
      alarmName  : state,
      alarmLevel : 1,
      alarmType  : state,
      alarmDesc  : state,
    });
    const logFormData = new FormData();

    reportInfo.alarmTime = new Date().valueOf();

    const logData = await this.provideTodayLog();

    logFormData.append('log', logData);

    logFormData.append('param', JSON.stringify(reportInfo));

    if (this.api) return this.api(this.clientId, logFormData, { headers: logFormData.getHeaders() });

    return ylDeviceManagement.reportAlarm(this.clientId, logFormData, { headers: logFormData.getHeaders() });
  }
}

export default new AlarmReporter();
