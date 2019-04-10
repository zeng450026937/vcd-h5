export default [
  {
    name      : 'instance',
    path      : '/home/content/meeting/instance',
    meta      : {},
    component : () => import('@/renderer/views/Pages/Meeting/InstantMeeting.vue'),
  },
  {
    name      : 'join',
    path      : '/home/content/meeting/join',
    meta      : {},
    component : () => import('@/renderer/views/Pages/Meeting/EnterMeeting.vue'),
  },

  {
    name      : 'dial',
    path      : '/home/content/meeting/dial',
    meta      : {},
    component : () => import('@/renderer/views/Pages/Dial/DialPlate.vue'),
  },
];
