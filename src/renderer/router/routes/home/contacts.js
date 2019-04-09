export default [
  {
    name      : 'corporate',
    path      : '/home/content/contact/corporate',
    meta      : {},
    component : () => import('@/renderer/views/Pages/Contact/CorporateContact.vue'),
  },
  {
    name      : 'frequent',
    path      : '/home/content/contact/frequent',
    meta      : {},
    component : () => import('@/renderer/views/Pages/Contact/FrequentContact.vue'),
  },
  {
    name      : 'local',
    path      : '/home/content/contact/local',
    meta      : {},
    component : () => import('@/renderer/views/Pages/Contact/LocalContact.vue'),
  },
];
