import { MAIN, MODULE_NAME } from '../../constants';

export default [
  {
    name      : 'corporate',
    path      : '/main/content/contact/corporate',
    meta      : {},
    component : () => import('@/renderer/views/Pages/Contact/CorporateContact.vue'),
  },
  {
    name      : 'frequent',
    path      : '/main/content/contact/frequent',
    meta      : {},
    component : () => import('@/renderer/views/Pages/Contact/FrequentContact.vue'),
  },
  {
    name      : 'local',
    path      : '/main/content/contact/local',
    meta      : {},
    component : () => import('@/renderer/views/Pages/Contact/LocalContact.vue'),
  },
];
