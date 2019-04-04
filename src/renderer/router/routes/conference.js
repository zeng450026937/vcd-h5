export default {
  name      : 'conference',
  path      : '/conference',
  component : () => import('@/renderer/views/Layout/Conference.vue'),
  children  : [
    {
      name       : 'conferenceContent',
      path       : '/conference/content',
      components : {
        header  : () => import('@/renderer/components/Conference/ConferenceHeader.vue'),
        sidebar : () => import('@/renderer/components/Main/Sidebar.vue'),
        default : () => import('@/renderer/views/Layout/ConferenceContent.vue'),
      },
      children : [
        {
          name      : 'conferenceDrawer',
          path      : '/conference/content/tabs',
          component : () => import('@/renderer/views/Pages/Conference/ConferenceDrawer.vue'),
        },
      ],
    },
  ],
};
