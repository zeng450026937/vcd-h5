export default [
  {
    name      : 'instance',
    path      : '/main/content/meeting/instance',
    meta      : {},
    component : () => import('@/renderer/views/Pages/Meeting/InstantMeeting.vue'),
  },
  {
    name      : 'join',
    path      : '/main/content/meeting/join',
    meta      : {},
    component : () => import('@/renderer/views/Pages/Meeting/EnterMeeting.vue'),
  },

  {
    name      : 'dial',
    path      : '/main/content/meeting/dial',
    meta      : {},
    component : () => import('@/renderer/views/Pages/Dial/DialPlate.vue'),
  },
];
