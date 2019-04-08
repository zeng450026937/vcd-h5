import contacts from './contacts';
import record from './record';
import setting from './setting';
import calender from './calendar';
import meeting from './meeting';

export default {
  name      : 'main',
  path      : '/main',
  component : () => import('@/renderer/views/Layout/Main.vue'),
  children  : [
    {
      path       : '',
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
        ...calender,
      ],
    },
  ],
};
