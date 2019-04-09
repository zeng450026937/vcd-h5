export default [
  {
    name      : 'schedule',
    path      : '/home/content/schedule',
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
