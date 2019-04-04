import { LOGIN, MODULE_NAME } from './constants';

export default [
  {
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
  },
  {
    name      : 'main',
    path      : '/main',
    component : () => import('@/renderer/views/Layout/Main.vue'),
    children  : [
      {
        name       : 'mainContent',
        path       : '/main/content',
        components : {
          sidebar : () => import('@/renderer/components/Main/Sidebar.vue'),
          default : () => import('@/renderer/views/Layout/MainContent.vue'),
        },
        children : [
          // contact
          {
            name      : 'corporateContact',
            path      : '/main/content/corporateContact',
            meta      : { owner: MODULE_NAME.CONTACT },
            component : () => import('@/renderer/views/Pages/Contact/CorporateContact.vue'),
          },
          {
            name      : 'frequentContact',
            path      : '/main/content/frequentContact',
            meta      : { owner: MODULE_NAME.CONTACT },
            component : () => import('@/renderer/views/Pages/Contact/FrequentContact.vue'),
          },
          {
            name      : 'localContact',
            path      : '/main/content/localContact',
            meta      : { owner: MODULE_NAME.CONTACT },
            component : () => import('@/renderer/views/Pages/Contact/LocalContact.vue'),
          },
          // meeting
          {
            name      : 'instanceMeeting',
            path      : '/main/content/instanceMeeting',
            meta      : { owner: 'meeting' },
            component : () => import('@/renderer/views/Pages/Meeting/InstantMeeting.vue'),
          },
          {
            name      : 'enterMeeting',
            path      : '/main/content/enterMeeting',
            meta      : { owner: MODULE_NAME.MEETING },
            component : () => import('@/renderer/views/Pages/Meeting/EnterMeeting.vue'),
          },
          {
            name      : 'callRecord',
            path      : '/main/content/callRecord',
            meta      : { owner: MODULE_NAME.MEETING },
            component : () => import('@/renderer/views/Pages/Record/CallRecord.vue'),
          },
          {
            name      : 'dialPlate',
            path      : '/main/content/dialPlate',
            meta      : { owner: MODULE_NAME.MEETING },
            component : () => import('@/renderer/views/Pages/Dial/DialPlate.vue'),
          },
          {
            name      : 'recordInfo',
            path      : '/main/content/recordInfo',
            meta      : { owner: MODULE_NAME.MEETING },
            component : () => import('@/renderer/views/Pages/Record/CallRecordInfo.vue'),
          },
          // calendar
          {
            name      : 'calendarView',
            path      : '/main/content/calendarView',
            meta      : { owner: MODULE_NAME.CALENDAR },
            component : () => import('@/renderer/views/Pages/Calendar/CalendarView.vue'),
          },
          {
            name      : 'calendarReserve',
            path      : '/main/content/calendarReserve',
            meta      : { owner: MODULE_NAME.CALENDAR },
            component : () => import('@/renderer/views/Pages/Calendar/CalendarReserve.vue'),
          },
          // setting
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
        ],
      },
    ],
  },
  {
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
  },
  {
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
  },
  {
    path     : '*',
    redirect : LOGIN.LOGIN_CONTENT,
  },
];
