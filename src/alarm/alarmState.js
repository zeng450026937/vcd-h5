/**
 * level
 * 
 * 0 - critical
 * 1 - error
 * 2 - warn
 * */

/**
 * code
 * 
 * 000000 ~ 099999 critical
 * 100000 ~ 199999 error
 * 200000 ~ 299999 warn
 */

export default {
  MAIN_PROCESS_CRASAH : {
    code    : '001',
    level   : 0,
    type    : '',
    cause   : 'PROCESS_ERROR',
    message : 'MAIN_PROCESS_CRASAH',
  },
  RENDER_PROCESS_CRASAH : {
    code    : '002',
    level   : 0,
    cause   : 'PROCESS_ERROR',
    message : 'RENDER_PROCESS_CRASAH',
  },
  FAILED_TO_JOIN_CONFERENCE : {
    code    : '003',
    level   : 1,
    cause   : 'CONFERENCE_ERROR',
    message : 'FAILED_TO_JOIN_CONFERENCE',
  },
  ABNORMAL_DISCONNECTION : {
    code    : '004',
    level   : 1,
    cause   : 'CONFERENCE_ERROR',
    message : 'ABNORMAL_DISCONNECTION',
  },
  CONFERENCE_CONTROL_OPERATION_FAILED : {
    code    : '005',
    level   : 1,
    cause   : 'API_ERROR',
    message : 'CONFERENCE_CONTROL_OPERATION_FAILED',
  },
  CONTACT_ACQUISITION_FAILED : {
    code    : '006',
    level   : 2,
    cause   : 'API_ERROR',
    message : 'CONTACT_ACQUISITION_FAILED',
  },
  SCHEDULE_ACQUISITION_FAILED : {
    code    : '007',
    level   : 2,
    cause   : 'API_ERROR',
    message : 'SCHEDULE_ACQUISITION_FAILED',
  },
};
