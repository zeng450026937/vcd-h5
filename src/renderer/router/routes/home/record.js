export default [
  {
    name      : 'recordDetail',
    path      : '/home/content/record/detail',
    meta      : {},
    component : () => import('@/renderer/views/Pages/Record/CallRecordInfo.vue'),
  },
  {
    name      : 'records',
    path      : '/home/content/record/list',
    meta      : {},
    component : () => import('@/renderer/views/Pages/Record/CallRecord.vue'),
  },
];
