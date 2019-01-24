import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

const router = new Router({
  mode   : process.type === 'renderer' ? 'hash' : 'history',
  base   : process.env.BASE_URL,
  routes : [
    {
      path       : '/login',
      name       : 'login',
      components : {
        header  : () => import(/* webpackChunkName: "login-header" */ '@/renderer/components/login/LoginHeader.vue'),
        default : () => import(/* webpackChunkName: "login-preview" */ '@/renderer/views/AppLogin.vue'),
      },
      children : [
        {
          name      : 'login-cloud',
          path      : 'cloud',
          component : () => import(/* webpackChunkName: "login-cloud" */ '@/renderer/components/login/CloudLogin.vue'),
        },
        {
          name      : 'login-yms',
          path      : 'yms',
          component : () => import(/* webpackChunkName: "login-yms" */ '@/renderer/components/login/YMSLogin.vue'),
        },
        {
          name      : 'meeting-cloud',
          path      : 'm-cloud',
          component : () => import(/* webpackChunkName: "meeting-cloud" */ '@/renderer/components/login/CloudMeeting.vue'),
        },
        {
          name      : 'meeting-yms',
          path      : 'm-yms',
          component : () => import(/* webpackChunkName: "meeting-yms" */ '@/renderer/components/login/YMSMeeting.vue'),
        },
      ],
    },
    {
      path       : '/main',
      name       : 'main',
      components : {
        sidebar : () => import(/* webpackChunkName: "main-header" */ '@/renderer/components/main/MainSidebar.vue'),
        default : () => import(/* webpackChunkName: "main-default" */ '@/renderer/views/AppMain.vue'),
      },
      children : [
        {
          name      : 'main-meeting',
          path      : 'meeting',
          component : () => import(/* webpackChunkName: "main-calendar" */ '@/renderer/views/MainMeeting.vue'),
          children  : [
            {
              name      : 'instance-meeting',
              path      : 'instance',
              component : () => import(/* webpackChunkName: "instance-meeting" */ '@/renderer/components/meeting/InstantMeeting.vue'),
            },
            {
              name      : 'enter-meeting',
              path      : 'enter',
              component : () => import(/* webpackChunkName: "enter-meeting" */ '@/renderer/components/meeting/EnterMeeting.vue'),
            },
            {
              name      : 'call-record',
              path      : 'record',
              component : () => import(/* webpackChunkName: "call-record" */ '@/renderer/components/meeting/CallRecord.vue'),
            },
            {
              name      : 'dial-plate',
              path      : 'dial',
              component : () => import(/* webpackChunkName: "dial-plate" */ '@/renderer/components/meeting/DialPlate.vue'),
            },
            {
              name      : 'call-record-info',
              path      : 'record-info',
              component : () => import(/* webpackChunkName: "call-record-info" */ '@/renderer/components/meeting/CallRecordInfo.vue'),
            },
          ],
        },
        {
          name      : 'main-calendar',
          path      : 'calendar',
          component : () => import(/* webpackChunkName: "main-calendar" */ '@/renderer/views/MainCalendar.vue'),
          children  : [
            {
              name      : 'view-calendar',
              path      : 'view',
              component : () => import(/* webpackChunkName: "view-calendar" */ '@/renderer/components/calendar/CalendarView.vue'),
            },
            {
              name      : 'reserve-meeting',
              path      : 'reserve',
              component : () => import(/* webpackChunkName: "reserve-meeting" */ '@/renderer/components/calendar/ReserveMeeting.vue'),
            },
          ],
        },
        {
          name      : 'main-contact',
          path      : 'contact',
          component : () => import(/* webpackChunkName: "main-contact" */ '@/renderer/views/MainContact.vue'),
          children  : [
            {
              name      : 'corporate-contact',
              path      : 'corporate',
              component : () => import(/* webpackChunkName: "corporate-contact" */ '@/renderer/components/contact/CorporateContact.vue'),
            },
            {
              name      : 'frequent-contact',
              path      : 'frequent',
              component : () => import(/* webpackChunkName: "frequent-contact" */ '@/renderer/components/contact/FrequentContact.vue'),
            },
            {
              name      : 'local-contact',
              path      : 'local',
              component : () => import(/* webpackChunkName: "local-contact" */ '@/renderer/components/contact/LocalContact.vue'),
            },
          ],
        },
        {
          name      : 'main-feedback',
          path      : 'feedback',
          component : () => import(/* webpackChunkName: "main-feedback" */ '@/renderer/views/MainFeedback.vue'),
        },
        {
          name      : 'main-setting',
          path      : 'setting',
          component : () => import(/* webpackChunkName: "main-meeting" */ '@/renderer/views/MainSetting.vue'),
          children  : [
            {
              name      : 'account-setting',
              path      : 'account',
              component : () => import(/* webpackChunkName: "account-setting" */ '@/renderer/components/setting/AccountSetting.vue'),
            },
            {
              name      : 'common-setting',
              path      : 'common',
              component : () => import(/* webpackChunkName: "common-setting" */ '@/renderer/components/setting/CommonSetting.vue'),
            },
            {
              name      : 'conference-setting',
              path      : 'conference',
              component : () => import(/* webpackChunkName: "conference-setting" */ '@/renderer/components/setting/ConferenceSetting.vue'),
            },
            {
              name      : 'audio-setting',
              path      : 'audio',
              component : () => import(/* webpackChunkName: "audio-setting" */ '@/renderer/components/setting/AudioSetting.vue'),
            },
            {
              name      : 'video-setting',
              path      : 'video',
              component : () => import(/* webpackChunkName: "Video-setting" */ '@/renderer/components/setting/VideoSetting.vue'),
            },
            {
              name      : 'record-setting',
              path      : 'record',
              component : () => import(/* webpackChunkName: "record-setting" */ '@/renderer/components/setting/RecordSetting.vue'),
            },
            {
              name      : 'app-about',
              path      : 'about',
              component : () => import(/* webpackChunkName: "app-about" */ '@/renderer/components/setting/AppAbout.vue'),
            },
          ],
        },
      ],
    },
    {
      path      : '/conference',
      name      : 'conference',
      component : () => import(/* webpackChunkName: "conference-main" */ '@/renderer/views/AppConference.vue'),
      children  : [
        {
          name      : 'conference-tabs',
          path      : 'tabs',
          component : () => import(/* webpackChunkName: "conference-tabs" */ '@/renderer/components/conference/TabGroup.vue'),
        },
      ],
    },
    {
      path : '/call',
      name : 'call',
    },
    {
      path     : '*',
      redirect : '/login/cloud',
    },
  ],
});

if (router.mode === 'abstract') {
  router.replace('/login');
}

window.router = router;

export default router;
