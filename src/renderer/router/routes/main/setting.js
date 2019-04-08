import { MAIN, MODULE_NAME } from '../../constants';

export default [
  {
    name      : 'account',
    path      : '/main/content/setting/account',
    meta      : {},
    component : () => import('@/renderer/views/Pages/Setting/AccountSetting.vue'),
  },
  {
    name      : 'common',
    path      : '/main/content/setting/common',
    meta      : {},
    component : () => import('@/renderer/views/Pages/Setting/CommonSetting.vue'),
  },
  {
    name      : 'confSetting',
    path      : '/main/content/setting/conference',
    meta      : {},
    component : () => import('@/renderer/views/Pages/Setting/ConferenceSetting.vue'),
  },
  {
    name      : 'audio',
    path      : '/main/content/setting/audio',
    meta      : {},
    component : () => import('@/renderer/views/Pages/Setting/AudioSetting.vue'),
  },
  {
    name      : 'video',
    path      : '/main/content/setting/video',
    meta      : {},
    component : () => import('@/renderer/views/Pages/Setting/VideoSetting.vue'),
  },
  {
    name      : 'about',
    path      : '/main/content/setting/about',
    meta      : {},
    component : () => import('@/renderer/views/Pages/Setting/AppAbout.vue'),
  },
];
