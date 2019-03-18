import Vue from 'vue';
import Router from 'vue-router';
import { LOGIN, MODULE_NAME } from './constants';

Vue.use(Router);

const router = new Router({
  mode   : process.type === 'renderer' ? 'hash' : 'history',
  base   : process.env.BASE_URL,
  routes : [
    {
      name      : 'login',
      path      : '/login',
      component : () => import(/* webpackChunkName: "layoutLogin" */ '@/renderer/views/LayoutLogin.vue'),
      children  : [
        {
          name       : 'loginContent',
          path       : 'loginContent',
          components : {
            default : () => import(/* webpackChunkName: "loginContent" */ '@/renderer/components/Login/LoginContent.vue'),
          },
        },
        {
          name       : 'meetingContent',
          path       : 'meetingContent',
          components : {
            default : () => import(/* webpackChunkName: "meetingContent" */ '@/renderer/components/Login/MeetingContent.vue'),
          },
        },
      ],
    },
    {
      name      : 'main',
      path      : '/main',
      component : () => import(/* webpackChunkName: "main" */ '@/renderer/views/LayoutMain.vue'),
      children  : [
        {
          name       : 'mainContent',
          path       : 'content',
          components : {
            sidebar : () => import(/* webpackChunkName: "mainSidebar" */ '@/renderer/components/Main/MainSidebar.vue'),
            default : () => import(/* webpackChunkName: "layoutMainContent" */ '@/renderer/views/LayoutMainContent.vue'),
          },
          children : [
            // contact
            {
              name      : 'corporateContact',
              path      : 'corporateContact',
              meta      : { owner: MODULE_NAME.CONTACT },
              component : () => import(/* webpackChunkName: "corporateContact" */ '@/renderer/components/Main/Contact/CorporateContact.vue'),
            },
            {
              name      : 'frequentContact',
              path      : 'frequentContact',
              meta      : { owner: MODULE_NAME.CONTACT },
              component : () => import(/* webpackChunkName: "frequentContact" */ '@/renderer/components/Main/Contact/FrequentContact.vue'),
            },
            {
              name      : 'localContact',
              path      : 'localContact',
              meta      : { owner: MODULE_NAME.CONTACT },
              component : () => import(/* webpackChunkName: "frequentContact" */ '@/renderer/components/Main/Contact/LocalContact.vue'),
            },
            {
              name      : 'contactTest',
              path      : 'contactTest',
              component : () => import('@/renderer/components/Main/Contact/contactTest.vue'),
            },
            // meeting
            {
              name      : 'instanceMeeting',
              path      : 'instanceMeeting',
              meta      : { owner: 'meeting' },
              component : () => import(/* webpackChunkName: "instanceMeeting" */ '@/renderer/components/Main/Meeting/InstantMeeting.vue'),
            },
            {
              name      : 'enterMeeting',
              path      : 'enterMeeting',
              meta      : { owner: MODULE_NAME.MEETING },
              component : () => import(/* webpackChunkName: "enterMeeting" */ '@/renderer/components/Main/Meeting/EnterMeeting.vue'),
            },
            {
              name      : 'callRecord',
              path      : 'callRecord',
              meta      : { owner: MODULE_NAME.MEETING },
              component : () => import(/* webpackChunkName: "callRecord" */ '@/renderer/components/Main/Meeting/CallRecord.vue'),
            },
            {
              name      : 'dialPlate',
              path      : 'dialPlate',
              meta      : { owner: MODULE_NAME.MEETING },
              component : () => import(/* webpackChunkName: "dialPlate" */ '@/renderer/components/Main/Meeting/DialPlate.vue'),
            },
            {
              name      : 'recordInfo',
              path      : 'recordInfo',
              meta      : { owner: MODULE_NAME.MEETING },
              component : () => import(/* webpackChunkName: "recordInfo" */ '@/renderer/components/Main/Meeting/CallRecordInfo.vue'),
            },
            // calendar
            {
              name      : 'calendarView',
              path      : 'calendarView',
              meta      : { owner: MODULE_NAME.CALENDAR },
              component : () => import(/* webpackChunkName: "calendarView" */ '@/renderer/components/Main/Calendar/CalendarView.vue'),
            },
            {
              name      : 'calendarReserve',
              path      : 'calendarReserve',
              meta      : { owner: MODULE_NAME.CALENDAR },
              component : () => import(/* webpackChunkName: "calendarReserve" */ '@/renderer/components/Main/Calendar/CalendarReserve.vue'),
            },
            // setting
            {
              name      : 'accountSetting',
              path      : 'accountSetting',
              meta      : { owner: MODULE_NAME.SETTING },
              component : () => import(/* webpackChunkName: "accountSetting" */ '@/renderer/components/Main/Setting/AccountSetting.vue'),
            },
            {
              name      : 'commonSetting',
              path      : 'commonSetting',
              meta      : { owner: MODULE_NAME.SETTING },
              component : () => import(/* webpackChunkName: "commonSetting" */ '@/renderer/components/Main/Setting/CommonSetting.vue'),
            },
            {
              name      : 'conferenceSetting',
              path      : 'conferenceSetting',
              meta      : { owner: MODULE_NAME.SETTING },
              component : () => import(/* webpackChunkName: "conferenceSetting" */ '@/renderer/components/Main/Setting/ConferenceSetting.vue'),
            },
            {
              name      : 'audioSetting',
              path      : 'audioSetting',
              meta      : { owner: MODULE_NAME.SETTING },
              component : () => import(/* webpackChunkName: "audioSetting" */ '@/renderer/components/Main/Setting/AudioSetting.vue'),
            },
            {
              name      : 'videoSetting',
              path      : 'videoSetting',
              meta      : { owner: MODULE_NAME.SETTING },
              component : () => import(/* webpackChunkName: "VideoSetting" */ '@/renderer/components/Main/Setting/VideoSetting.vue'),
            },
            {
              name      : 'aboutUs',
              path      : 'aboutUs',
              meta      : { owner: MODULE_NAME.SETTING },
              component : () => import(/* webpackChunkName: "aboutUs" */ '@/renderer/components/Main/Setting/AppAbout.vue'),
            },
          ],
        },
      ],
    },
    {
      name      : 'conference',
      path      : '/conference',
      component : () => import(/* webpackChunkName: "layoutConference" */ '@/renderer/views/LayoutConference.vue'),
      children  : [
        {
          name       : 'conferenceContent',
          path       : 'content',
          components : {
            header  : () => import(/* webpackChunkName: "conferenceHeader" */ '@/renderer/components/Conference/ConferenceHeader.vue'),
            sidebar : () => import(/* webpackChunkName: "mainSidebar" */ '@/renderer/components/Main/MainSidebar.vue'),
            default : () => import(/* webpackChunkName: "layoutConferenceContent" */ '@/renderer/views/LayoutConferenceContent.vue'),
          },
          children : [
            {
              name      : 'conferenceDrawer',
              path      : 'tabs',
              component : () => import(/* webpackChunkName: "conferenceDrawer" */ '@/renderer/components/Conference/ConferenceDrawer.vue'),
            },
          ],
        },
      ],
    },
    {
      name      : 'call',
      path      : '/call',
      component : () => import(/* webpackChunkName: "layoutCall" */ '@/renderer/views/LayoutCall.vue'),
      children  : [
        {
          name       : 'callContent',
          path       : 'content',
          components : {
            header  : () => import(/* webpackChunkName: "callHeader" */ '@/renderer/components/Call/CallHeader.vue'),
            sidebar : () => import(/* webpackChunkName: "mainSidebar" */ '@/renderer/components/Main/MainSidebar.vue'),
            default : () => import(/* webpackChunkName: "layoutCallContent" */ '@/renderer/views/LayoutCallContent.vue'),
          },
          children : [
            {
              name      : 'callDrawer',
              path      : 'tabs',
              component : () => import(/* webpackChunkName: "callDrawer" */ '@/renderer/components/Call/CallDrawer.vue'),
            },
          ],
        },
      ],
    },
    {
      path     : '*',
      redirect : LOGIN.LOGIN_CONTENT,
    },
  ],
});

if (router.mode === 'abstract') {
  router.replace(LOGIN.LOGIN_CONTENT);
}

window.router = router;

export default router;
