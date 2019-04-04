import { MODULE_NAME } from '../../constants';

export default [
  {
    name      : 'corporateContact',
    path      : '/main/content/corporateContact',
    meta      : { owner: MODULE_NAME.CONTACT },
    component : () => import('@/renderer/views/Pages/Contact/CorporateContact.vue'),
  },
  {
    name      : 'frequentContact',
    path      : '/main/content/frequentContact',
    meta      : { owner: MODULE_NAME.CONTACT },
    component : () => import('@/renderer/views/Pages/Contact/FrequentContact.vue'),
  },
  {
    name      : 'localContact',
    path      : '/main/content/localContact',
    meta      : { owner: MODULE_NAME.CONTACT },
    component : () => import('@/renderer/views/Pages/Contact/LocalContact.vue'),
  },
]
