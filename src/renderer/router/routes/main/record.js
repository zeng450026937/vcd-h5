import { MAIN } from '../../constants';

export default [
  {
    name      : 'recordDetail',
    path      : '/main/content/record/detail',
    meta      : {},
    component : () => import('@/renderer/views/Pages/Record/CallRecordInfo.vue'),
  },
  {
    name      : 'records',
    path      : '/main/content/record/list',
    meta      : {},
    component : () => import('@/renderer/views/Pages/Record/CallRecord.vue'),
  },
];
