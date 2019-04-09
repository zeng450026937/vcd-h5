export default [
  {
    name      : 'calendar',
    path      : '/home/content/calendar',
    meta      : {},
    component : () => import('@/renderer/views/Pages/Calendar/CalendarView.vue'),
  },
  {
    name      : 'reservation',
    path      : '/home/content/reservation',
    meta      : {},
    component : () => import('@/renderer/views/Pages/Calendar/CalendarReserve.vue'),
  },
];
