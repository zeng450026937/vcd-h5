/**
 * alarmLevel
 * 
 * 0 - critical
 * 1 - error
 * 2 - warn
 * */

/**
 * alarmCode
 * 
 * 000000 ~ 099999 critical
 * 100000 ~ 199999 error
 * 200000 ~ 299999 warn
 */

export default {
  MAIN_PROCESS_CRASAH : {
    alarmCode  : '001',
    alarmName  : 'MAIN_PROCESS_CRASAH',
    alarmLevel : 0,
    alarmType  : 'PROCESS_ERROR',
    alarmDesc  : 'PROCESS_ERROR',
    alarmTime  : null,
  },
  RENDER_PROCESS_CRASAH : {
    alarmCode  : '002',
    alarmName  : 'RENDER_PROCESS_CRASAH',
    alarmLevel : 0,
    alarmType  : 'PROCESS_ERROR',
    alarmDesc  : 'PROCESS_ERROR',
    alarmTime  : null,
  },
  FAILED_TO_JOIN_CONFERENCE : {
    alarmCode  : '003',
    alarmName  : 'FAILED_TO_JOIN_CONFERENCE',
    alarmLevel : 1,
    alarmType  : 'CONFERENCE_ERROR',
    alarmDesc  : 'CONFERENCE_ERROR',
    alarmTime  : null,
  },
  ABNORMAL_DISCONNECTION : {
    alarmCode  : '004',
    alarmName  : 'ABNORMAL_DISCONNECTION',
    alarmLevel : 1,
    alarmType  : 'CONFERENCE_ERROR',
    alarmDesc  : 'CONFERENCE_ERROR',
    alarmTime  : null,
  },
  CONFERENCE_CONTROL_OPERATION_FAILED : {
    alarmCode  : '005',
    alarmName  : 'CONFERENCE_CONTROL_OPERATION_FAILED',
    alarmLevel : 1,
    alarmType  : 'API_ERROR',
    alarmDesc  : 'API_ERROR',
    alarmTime  : null,
  },
  CONTACT_ACQUISITION_FAILED : {
    alarmCode  : '006',
    alarmName  : 'CONTACT_ACQUISITION_FAILED',
    alarmLevel : 2,
    alarmType  : 'API_ERROR',
    alarmDesc  : 'API_ERROR',
    alarmTime  : null,
  },
  SCHEDULE_ACQUISITION_FAILED : {
    alarmCode  : '007',
    alarmName  : 'SCHEDULE_ACQUISITION_FAILED',
    alarmLevel : 2,
    alarmType  : 'API_ERROR',
    alarmDesc  : 'API_ERROR',
    alarmTime  : null,
  },
};
