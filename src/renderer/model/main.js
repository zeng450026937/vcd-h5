import Vuem from './vuem';
import kom from '.';

import { LOGIN, MAIN, MODULE_NAME } from '../router/constants';
import rtc from '../rtc';
import router from '../router';

const model = new Vuem();

const initialSidebar = () => {
  const isCloud = kom.vm.account.serverType === 'cloud';
  const sidebar = [
    { icon         : 'icon-huiyi',
      text         : '会议',
      name         : MODULE_NAME.MEETING,
      isTop        : true,
      currentRoute : MAIN.MEETING_INSTANCE,
      navs         : [
        { icon: 'icon-jishihuiyi', route: MAIN.MEETING_INSTANCE, text: '即时会议' },
        { icon: 'icon-jiaruhuiyi', route: MAIN.MEETING_ENTER, text: '加入会议' },
        { icon: 'icon-tonghuajilu', route: MAIN.CALL_RECORD, text: '通话记录' },
        { icon: 'icon-bohao', route: MAIN.DIAL_PLATE, text: '拨号' },
      ],
    },
    { icon: 'icon-richeng', text: '日程', name: MODULE_NAME.CALENDAR, currentRoute: MAIN.CALENDAR_VIEW },
    {
      icon         : 'icon-lianxiren',
      text         : '联系人',
      name         : MODULE_NAME.CONTACT,
      currentRoute : MAIN.CONTACT_CORPORATE,
      navs         : isCloud
        ? [
          { icon: 'icon-qiyelianxiren', route: MAIN.CONTACT_CORPORATE, text: '企业联系人' },
          { icon: 'icon-bendilianxiren', route: MAIN.CONTACT_LOCAL, text: '本地联系人' },
        ]
        : [ { icon: 'icon-qiyelianxiren', route: MAIN.CONTACT_CORPORATE, text: '企业联系人' },
          { icon: 'icon-changyonglianxiren', route: MAIN.CONTACT_FREQUENT, text: '常用联系人' },
          { icon: 'icon-bendilianxiren', route: MAIN.CONTACT_LOCAL, text: '本地联系人' },
        ],
    },
    {
      icon         : 'icon-shezhi',
      text         : '设置',
      name         : MODULE_NAME.SETTING,
      currentRoute : MAIN.SETTING_ACCOUNT,
      navs         : [
        { icon: 'icon-gerenziliao', route: MAIN.SETTING_ACCOUNT, text: '个人资料' },
        { icon: 'icon-tongyong', route: MAIN.SETTING_COMMON, text: '通用' },
        { icon: 'icon-huiyishi', route: MAIN.SETTING_CONFERENCE, text: '会议' },
        { icon: 'icon-maikefeng', route: MAIN.SETTING_AUDIO, text: '音频' },
        { icon: 'icon-shexiangtou', route: MAIN.SETTING_VIDEO, text: '视频' },
        { icon: 'icon-guanyu', route: MAIN.ABOUT_US, text: '关于' },
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
      sidebarItems   : [],
      currentNav     : {},
      currentSidebar : {},
    };
  },
  computed : {
    isRegistered() {
      return rtc.account.status === 'registered';
    },
    sidebarMap() {
      return {
        meeting : this.sidebarItems[0],
        contact : this.sidebarItems[2],
        setting : this.sidebarItems[3],
      };
    },
    isConferenceDisConnected() {
      return rtc.conference.disconnected;
    },
    isCallDisConnected() {
      return rtc.call.disconnected;
    },
  },
  watch : {
    isRegistered : {
      async handler(val) {
        this.sidebarItems = val ? initialSidebar() : [];
        this.currentSidebar = val ? this.sidebarItems[0] : {};
        // router.push(val ? MAIN.MEETING_INSTANCE : LOGIN.LOGIN_CONTENT);
      },
      immediate : true,
    },
    isConferenceDisConnected(val) {
      if (val && this.isCallDisConnected) {
        router.push(this.isRegistered ? this.currentNav.route : LOGIN.LOGIN_CONTENT);
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
