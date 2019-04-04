import { MODULE_NAME } from '../../constants';

export default [
  {
    name      : 'calendarView',
    path      : '/main/content/calendarView',
    meta      : { owner: MODULE_NAME.CALENDAR },
    component : () => import('@/renderer/views/Pages/Calendar/CalendarView.vue'),
  },
  {
    name      : 'calendarReserve',
    path      : '/main/content/calendarReserve',
    meta      : { owner: MODULE_NAME.CALENDAR },
    component : () => import('@/renderer/views/Pages/Calendar/CalendarReserve.vue'),
  },
]
