export default {
  name      : 'login',
  path      : '/login',
  component : () => import('@/renderer/views/Layout/Login.vue'),
  children  : [
    {
      name       : 'loginContent',
      path       : '/login/main',
      components : {
        default : () => import('@/renderer/views/Pages/Login.vue'),
      },
    },
    {
      name       : 'loginMeeting',
      path       : '/login/meeting',
      components : {
        default : () => import('@/renderer/views/Pages/Meeting.vue'),
      },
    },
  ],
};
