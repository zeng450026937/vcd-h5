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
      name       : 'mainContent',
      path       : '/main/content',
      components : {
        sidebar : () => import('@/renderer/components/Main/Sidebar.vue'),
        default : () => import('@/renderer/views/Layout/MainContent.vue'),
      },
      children : [
        ...contacts,
        ...record,
        ...setting,
        ...calender,
        ...meeting,
      ],
    },
  ],
};
