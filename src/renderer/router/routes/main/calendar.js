import { MODULE_NAME } from '../../constants';

export default [
  {
    name      : 'calendar',
    path      : '/main/content/calendar',
    meta      : {},
    component : () => import('@/renderer/views/Pages/Calendar/CalendarView.vue'),
  },
  {
    name      : 'reservation',
    path      : '/main/content/reservation',
    meta      : {},
    component : () => import('@/renderer/views/Pages/Calendar/CalendarReserve.vue'),
  },
];
