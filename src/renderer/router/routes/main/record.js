import { MODULE_NAME } from '../../constants';

export default [
  {
    name      : 'recordInfo',
    path      : '/main/content/recordInfo',
    meta      : { owner: MODULE_NAME.MEETING },
    component : () => import('@/renderer/views/Pages/Record/CallRecordInfo.vue'),
  },
  {
    name      : 'callRecord',
    path      : '/main/content/callRecord',
    meta      : { owner: MODULE_NAME.MEETING },
    component : () => import('@/renderer/views/Pages/Record/CallRecord.vue'),
  },
]
