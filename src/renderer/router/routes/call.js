export default {
  name      : 'call',
  path      : '/call',
  component : () => import('@/renderer/views/Layout/Call.vue'),
  children  : [
    {
      name       : 'callContent',
      path       : '/call/content',
      components : {
        header  : () => import('@/renderer/components/Call/CallHeader.vue'),
        sidebar : () => import('@/renderer/components/Main/Sidebar.vue'),
        default : () => import('@/renderer/views/Layout/CallContent.vue'),
      },
      children : [
        {
          name      : 'callDrawer',
          path      : '/call/content/tabs',
          component : () => import('@/renderer/views/Pages/Call/CallDrawer.vue'),
        },
      ],
    },
  ],
};
