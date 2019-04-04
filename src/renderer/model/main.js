import Vuem from './vuem';
import kom from '.';

import { LOGIN, MAIN, MODULE_NAME } from '../router/constants';
import rtc from '../rtc';
import router from '../router';

const model = new Vuem();

const menus = {
  instance         : { icon: 'icon-jishihuiyi', route: MAIN.MEETING_INSTANCE, text: '即时会议' },
  join             : { icon: 'icon-jiaruhuiyi', route: MAIN.MEETING_ENTER, text: '加入会议' },
  record           : { icon: 'icon-tonghuajilu', route: MAIN.CALL_RECORD, text: '通话记录' },
  dial             : { icon: 'icon-bohao', route: MAIN.DIAL_PLATE, text: '拨号' },
  calendar         : { route: MAIN.CALENDAR_VIEW },
  corporateContact : { icon: 'icon-qiyelianxiren', route: MAIN.CONTACT_CORPORATE, text: '企业联系人' },
  frequentContacts : { icon: 'icon-changyonglianxiren', route: MAIN.CONTACT_FREQUENT, text: '常用联系人' },
  localContacts    : { icon: 'icon-bendilianxiren', route: MAIN.CONTACT_LOCAL, text: '本地联系人' },
  information      : { icon: 'icon-gerenziliao', route: MAIN.SETTING_ACCOUNT, text: '个人资料' },
  common           : { icon: 'icon-tongyong', route: MAIN.SETTING_COMMON, text: '通用' },
  conference       : { icon: 'icon-huiyishi', route: MAIN.SETTING_CONFERENCE, text: '会议' },
  audio            : { icon: 'icon-maikefeng', route: MAIN.SETTING_AUDIO, text: '音频' },
  video            : { icon: 'icon-shexiangtou', route: MAIN.SETTING_VIDEO, text: '视频' },
  about            : { icon: 'icon-guanyu', route: MAIN.ABOUT_US, text: '关于' },
};


const initialSidebar = () => {
  const isCloud = kom.vm.account.serverType === 'cloud';
  const sidebar = [
    { icon         : 'icon-huiyi',
      text         : '会议',
      name         : MODULE_NAME.MEETING,
      isTop        : true,
      currentRoute : MAIN.MEETING_INSTANCE,
      navs         : [
        menus.instance,
        menus.join,
        menus.record,
        menus.dial,
      ],
    },
    { icon         : 'icon-richeng',
      text         : '日程',
      name         : MODULE_NAME.CALENDAR,
      currentRoute : MAIN.CALENDAR_VIEW,
      navs         : [
        menus.calendar,
      ],
    },
    {
      icon         : 'icon-lianxiren',
      text         : '联系人',
      name         : MODULE_NAME.CONTACT,
      currentRoute : MAIN.CONTACT_CORPORATE,
      navs         : isCloud
        ? [
          menus.corporateContact,
          menus.localContacts,
        ]
        : [
          menus.corporateContact,
          menus.frequentContacts,
          menus.localContacts,
        ],
    },
    {
      icon         : 'icon-shezhi',
      text         : '设置',
      name         : MODULE_NAME.SETTING,
      currentRoute : MAIN.SETTING_ACCOUNT,
      navs         : [
        menus.information,
        menus.common,
        menus.conference,
        menus.audio,
        menus.video,
        menus.about,
      ],
    },
  ];


  return sidebar;
};

model.provide({
  data() {
    return {
      searchText     : '',
      hasLoadMore    : false,
      searchResults  : [],
      sidebarList    : [],
      currentNav     : {},
      currentSidebar : {},
    };
  },
  computed : {
    isRegistered() {
      return rtc.account.status === 'registered';
    },
    sidebarMap() {
      const [ meeting, calendar, contact, setting ] = this.sidebarList;

      return {
        meeting,
        calendar,
        contact,
        setting,
      };
    },
    isConferenceDisConnected() {
      return rtc.conference.disconnected || rtc.conference.connectFailed;
    },
    isCallDisConnected() {
      return rtc.call.disconnected || rtc.call.failed;
    },
  },
  watch : {
    isRegistered : {
      async handler(val) {
        this.sidebarList = val ? initialSidebar() : [];
        this.currentSidebar = val ? this.sidebarMap.meeting : {};
        if (!val) {
          this.searchText = '';
          this.hasLoadMore = false;
          this.searchResults = [];
        }
      },
      immediate : true,
    },
    isConferenceDisConnected(val) {
      if (val && this.isCallDisConnected) {
        const { loginType } = this.$parent.account;
        const route = loginType === 'login' ? LOGIN.LOGIN_CONTENT : LOGIN.MEETING_CONTENT;

        router.push(this.isRegistered ? this.currentNav.route : route);
      }
    },
    isCallDisConnected(val) {
      if (val && this.isConferenceDisConnected) {
        router.push(this.isRegistered ? this.currentNav.route : LOGIN.LOGIN_CONTENT);
      }
    },
  },
});

export default model;
