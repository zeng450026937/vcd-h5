export default {
  path      : '',
  component : () => import('@/renderer/views/Layout/Login.vue'),
  children  : [
    {
      name       : 'join',
      path       : '/join',
      components : {
        default : () => import('@/renderer/views/Pages/Meeting.vue'),
      },
    },
  ],
};
