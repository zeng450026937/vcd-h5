import { MODULE_NAME } from '../../constants';

export default [
  {
    name      : 'instanceMeeting',
    path      : '/main/content/instanceMeeting',
    meta      : { owner: 'meeting' },
    component : () => import('@/renderer/views/Pages/Meeting/InstantMeeting.vue'),
  },
  {
    name      : 'enterMeeting',
    path      : '/main/content/enterMeeting',
    meta      : { owner: MODULE_NAME.MEETING },
    component : () => import('@/renderer/views/Pages/Meeting/EnterMeeting.vue'),
  },

  {
    name      : 'dialPlate',
    path      : '/main/content/dialPlate',
    meta      : { owner: MODULE_NAME.MEETING },
    component : () => import('@/renderer/views/Pages/Dial/DialPlate.vue'),
  },
];
