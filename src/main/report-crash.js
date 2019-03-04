import { Alarm } from '../ytms/uploader';

export function reportGpuCrash() {
  const api = ytms.getApi();

  if (!api) return;

  const alarm = Alarm.Create(api);

  alarm.code = '001';
  alarm.name = 'GPU_CRASAH';
  alarm.type = 'MAIN_PROCESS_CRASAH';
  alarm.level = 0;
  alarm.desc = 'GPU_PROCESS_ERROR';

  alarm.upload();
}

export function reportRendererCrash() {
  const api = ytms.getApi();

  if (!api) return;
  
  const alarm = Alarm.Create(api);

  alarm.code = '002';
  alarm.name = 'RENDER_CRASAH';
  alarm.type = 'RENDER_PROCESS_ERROR';
  alarm.level = 1;
  alarm.desc = 'RENDER_PROCESS_CRASAH';

  alarm.upload();
}

export function reportUncaughtException(isLaunchError, error) {
  const api = ytms.getApi();

  if (!api) return;
  
  const alarm = Alarm.Create(api);

  alarm.code = '003';
  alarm.name = 'UNCAUGHT_EXCEPTION';
  alarm.type = 'MAIN_PROCESS_ERROR';
  alarm.level = 0;
  alarm.desc = 'MAIN_PROCESS_CRASAH';


  alarm.upload();
}

export function reportConfOperateFailed() {
  const api = ytms.getApi();

  if (!api) return;

  const alarm = Alarm.Create(api);

  alarm.code = '004';
  alarm.name = 'CONFERENCE_CONTROL_FAILED';
  alarm.type = 'CONFERENCE_ERROR';
  alarm.level = 2;
  alarm.desc = 'CONFERENCE_CONTROL_OPERATION_FAILED';

  alarm.upload();
}

export function reportAbnormalDisconnect() {
  const api = ytms.getApi();

  if (!api) return;

  const alarm = Alarm.Create(api);

  alarm.code = '005';
  alarm.name = 'ABNORMAL_DISCONNECTION';
  alarm.type = 'CONFERENCE_ERROR';
  alarm.level = 2;
  alarm.desc = 'CONFERENCE_ABNORMAL_DISCONNECTION';

  alarm.upload();
}

export function reportContactsFailed() {
  const api = ytms.getApi();

  if (!api) return;

  const alarm = Alarm.Create(api);

  alarm.code = '006';
  alarm.name = 'CONTACT_ACQUISITION_FAILED';
  alarm.type = 'API_ERROR';
  alarm.level = 2;
  alarm.desc = 'CONTACT_ACQUISITION_FAILED';

  alarm.upload();
}

export function reportScheduleFailed() {
  const api = ytms.getApi();

  if (!api) return;

  const alarm = Alarm.Create(api);

  alarm.code = '007';
  alarm.name = 'SCHEDULE_ACQUISITION_FAILED';
  alarm.type = 'API_ERROR';
  alarm.level = 2;
  alarm.desc = 'SCHEDULE_ACQUISITION_FAILED';

  alarm.upload();
}
