import { MODULE_NAME } from '../../constants';

export default [
  {
    name      : 'accountSetting',
    path      : '/main/content/accountSetting',
    meta      : { owner: MODULE_NAME.SETTING },
    component : () => import('@/renderer/views/Pages/Setting/AccountSetting.vue'),
  },
  {
    name      : 'commonSetting',
    path      : '/main/content/commonSetting',
    meta      : { owner: MODULE_NAME.SETTING },
    component : () => import('@/renderer/views/Pages/Setting/CommonSetting.vue'),
  },
  {
    name      : 'conferenceSetting',
    path      : '/main/content/conferenceSetting',
    meta      : { owner: MODULE_NAME.SETTING },
    component : () => import('@/renderer/views/Pages/Setting/ConferenceSetting.vue'),
  },
  {
    name      : 'audioSetting',
    path      : '/main/content/audioSetting',
    meta      : { owner: MODULE_NAME.SETTING },
    component : () => import('@/renderer/views/Pages/Setting/AudioSetting.vue'),
  },
  {
    name      : 'videoSetting',
    path      : '/main/content/videoSetting',
    meta      : { owner: MODULE_NAME.SETTING },
    component : () => import('@/renderer/views/Pages/Setting/VideoSetting.vue'),
  },
  {
    name      : 'aboutUs',
    path      : '/main/content/aboutUs',
    meta      : { owner: MODULE_NAME.SETTING },
    component : () => import('@/renderer/views/Pages/Setting/AppAbout.vue'),
  },
];
