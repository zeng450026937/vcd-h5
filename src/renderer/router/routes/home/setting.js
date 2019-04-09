export default [
  {
    name      : 'account',
    path      : '/home/content/setting/account',
    meta      : {},
    component : () => import('@/renderer/views/Pages/Setting/AccountSetting.vue'),
  },
  {
    name      : 'common',
    path      : '/home/content/setting/common',
    meta      : {},
    component : () => import('@/renderer/views/Pages/Setting/CommonSetting.vue'),
  },
  {
    name      : 'confSetting',
    path      : '/home/content/setting/conference',
    meta      : {},
    component : () => import('@/renderer/views/Pages/Setting/ConferenceSetting.vue'),
  },
  {
    name      : 'audio',
    path      : '/home/content/setting/audio',
    meta      : {},
    component : () => import('@/renderer/views/Pages/Setting/AudioSetting.vue'),
  },
  {
    name      : 'video',
    path      : '/home/content/setting/video',
    meta      : {},
    component : () => import('@/renderer/views/Pages/Setting/VideoSetting.vue'),
  },
  {
    name      : 'about',
    path      : '/home/content/setting/about',
    meta      : {},
    component : () => import('@/renderer/views/Pages/Setting/AppAbout.vue'),
  },
];
