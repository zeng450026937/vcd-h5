export default {
  path      : '',
  component : () => import('@/renderer/views/Layout/Login.vue'),
  children  : [
    {
      name       : 'login',
      path       : '/login',
      components : {
        default : () => import('@/renderer/views/Pages/Login.vue'),
      },
    },
  ],
};
