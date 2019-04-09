import Vuem from './vuem';
import kom from '.';
import { LOGIN, } from '../router/constants';
import rtc from '../rtc';
import { findAllRoutes } from '../router/utils';
import router from '../router';

const model = new Vuem();


const genSidebarNavs = (routes) => {
  const sideNavs = {
    instance    : { icon: 'icon-jishihuiyi', text: '即时会议' },
    join        : { icon: 'icon-jiaruhuiyi', text: '加入会议' },
    records     : { icon: 'icon-tonghuajilu', text: '通话记录' },
    dial        : { icon: 'icon-bohao', text: '拨号' },
    calendar    : {},
    corporate   : { icon: 'icon-qiyelianxiren', text: '企业联系人' },
    frequent    : { icon: 'icon-changyonglianxiren', text: '常用联系人' },
    local       : { icon: 'icon-bendilianxiren', text: '本地联系人' },
    account     : { icon: 'icon-gerenziliao', text: '个人资料' },
    common      : { icon: 'icon-tongyong', text: '通用' },
    confSetting : { icon: 'icon-huiyishi', text: '会议' },
    audio       : { icon: 'icon-maikefeng', text: '音频' },
    video       : { icon: 'icon-shexiangtou', text: '视频' },
    about       : { icon: 'icon-guanyu', text: '关于' },
  };
  
  routes.forEach((route) => {
    if (sideNavs[route.name] != null) {
      sideNavs[route.name].path = route.path;
    }
  });
  
  return sideNavs;
};

const initialSidebar = () => {
  const isCloud = kom.vm.account.serverType === 'cloud';
  const routes = findAllRoutes(router.options.routes);
  const sideNavs = genSidebarNavs(routes);

  return [
    { icon        : 'icon-huiyi',
      text        : '会议',
      name        : 'meeting',
      currentPath : sideNavs.instance.path,
      navs        : [
        sideNavs.instance,
        sideNavs.join,
        sideNavs.records,
        sideNavs.dial,
      ],
    },
    { icon        : 'icon-richeng',
      text        : '日程',
      name        : 'calendar',
      currentPath : sideNavs.calendar.path,
      navs        : [],
    },
    {
      icon        : 'icon-lianxiren',
      text        : '联系人',
      name        : 'contact',
      currentPath : sideNavs.corporate.path,
      navs        : isCloud
        ? [
          sideNavs.corporate,
          sideNavs.local,
        ]
        : [
          sideNavs.corporate,
          sideNavs.frequent,
          sideNavs.local,
        ],
    },
    {
      icon        : 'icon-shezhi',
      text        : '设置',
      name        : 'setting',
      currentPath : sideNavs.account.path,
      navs        : [
        sideNavs.account,
        sideNavs.common,
        sideNavs.confSetting,
        sideNavs.audio,
        sideNavs.video,
        sideNavs.about,
      ],
    },
  ];
};

model.provide({
  data() {
    return {
      searchText     : '',
      hasLoadMore    : false,
      searchResults  : [],
      sidebar        : [],
      currentNav     : {},
      currentSidebar : {},

    };
  },
  methods : {
  },
  computed : {
    isRegistered() {
      return rtc.account.status === 'registered';
    },
    isConferenceDisConnected() {
      return rtc.conference.disconnected || rtc.conference.connectFailed;
    },
    isCallDisConnected() {
      return rtc.call.disconnected || rtc.call.failed;
    },
    sidebarMap() {
      const [ meeting, calendar, contact, setting ] = this.sidebar;

      return {
        meeting,
        calendar,
        contact,
        setting,
      };
    },
  },
  watch : {
    isRegistered : {
      async handler(val) {
        this.sidebar = val ? initialSidebar() : [];
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

        router.push(this.isRegistered ? this.currentNav.path : route);
      }
    },
    isCallDisConnected(val) {
      if (val && this.isConferenceDisConnected) {
        router.push(this.isRegistered ? this.currentNav.path : LOGIN.LOGIN_CONTENT);
      }
    },
  },
});

export default model;
