import contacts from './contacts';
import record from './record';
import setting from './setting';
import schedule from './schedule';
import meeting from './meeting';

export default {
  name      : 'home',
  path      : '/home',
  component : () => import('@/renderer/views/Layout/Main.vue'),
  children  : [
    {
      path       : '/home/content',
      components : {
        sidebar : () => import('@/renderer/components/Main/Sidebar.vue'),
        nav     : () => import('@/renderer/components/Main/MainNav.vue'),
        default : () => import('@/renderer/views/Layout/MainContent.vue'),
      },
      children : [
        ...contacts,
        ...meeting,
        ...record,
        ...setting,
        ...schedule,
      ],
    },
  ],
};
