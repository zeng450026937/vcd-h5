import Vuem from './vuem';
import kom from '.';
import { CONFERENCE, LOGIN, CALL } from '../router/constants';
import rtc from '../rtc';
import { findAllRoutes } from '../router/utils';
import router from '../router';

const model = new Vuem();


const genSidebarNavs = (routes) => {
  const sideNavs = {
    instance    : { icon: 'icon-jishihuiyi', text: '发起会议', i18nKey: 'nav.InitiateMeeting' },
    newMeeting  : { icon: 'icon-jishihuiyi', text: '新的会议', i18nKey: 'nav.newMeeting' },
    join        : { icon: 'icon-jiaruhuiyi', text: '加入会议', i18nKey: 'nav.joinMeeting' },
    dial        : { icon: 'icon-bohao', text: '拨号', i18nKey: 'nav.dial' },
    schedule    : {},
    corporate   : { icon: 'icon-qiyelianxiren', text: '企业联系人', i18nKey: 'nav.corporate' },
    frequent    : { icon: 'icon-changyonglianxiren', text: '常用联系人', i18nKey: 'nav.frequent' },
    local       : { icon: 'icon-bendilianxiren', text: '本地联系人', i18nKey: 'nav.local' },
    account     : { icon: 'icon-gerenziliao', text: '个人资料', i18nKey: 'nav.account' },
    common      : { icon: 'icon-tongyong', text: '通用', i18nKey: 'nav.common' },
    confSetting : { icon: 'icon-huiyishi', text: '会议', i18nKey: 'nav.conference' },
    audio       : { icon: 'icon-maikefeng', text: '音频', i18nKey: 'nav.audio' },
    video       : { icon: 'icon-shexiangtou', text: '视频', i18nKey: 'nav.video' },
    about       : { icon: 'icon-tongyongtishi', text: '关于', i18nKey: 'nav.about' },
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
      i18nKey     : 'nav.meeting',
      name        : 'meeting',
      currentPath : sideNavs.newMeeting.path,
      navs        : [
        // sideNavs.instance,
        sideNavs.newMeeting,
        sideNavs.join,
        sideNavs.dial,
      ],
    },
    { icon        : 'icon-richeng',
      text        : '日程',
      i18nKey     : 'nav.schedule',
      name        : 'schedule',
      currentPath : sideNavs.schedule.path,
      navs        : [ sideNavs.schedule ],
    },
    {
      icon        : 'icon-lianxiren',
      text        : '联系人',
      i18nKey     : 'nav.contact',
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
      i18nKey     : 'nav.setting',
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
  middleware : {
    async setCurrentSidebar(ctx, next) {
      await next();

      this.currentSidebar = this.sidebarMap[ctx.payload.name];
    },
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
      const [ meeting, schedule, contact, setting ] = this.sidebar;

      return {
        meeting,
        schedule,
        contact,
        setting,
      };
    },
    isInMiniConference() {
      return this.$parent.state.isInMiniConference;
    },
    isInMiniCall() {
      return this.$parent.state.isInMiniCall;
    },
  },
  watch : {
    isRegistered : {
      async handler(val) {
        if (val) {
          return setTimeout(() => { // 增加登陆时间
            if (this.isRegistered) { // 防止中途退出
              this.sidebar = initialSidebar();
              this.currentSidebar = this.sidebarMap.meeting;
            }
          }, 2000);
        }

        this.sidebar = [];
        this.currentSidebar = [];
        this.searchText = '';
        this.hasLoadMore = false;
        this.searchResults = [];
        router.push(LOGIN.LOGIN_CONTENT);
      },
      immediate : true,
    },
    isConferenceDisConnected(val) {
      if (this.isConferenceDisConnected && this.isCallDisConnected) {
        const { loginType } = this.$parent.account;
        const route = loginType === 'login' ? LOGIN.LOGIN_CONTENT : LOGIN.MEETING_CONTENT;

        router.push(this.isRegistered ? this.currentNav.path : route);
      }
    },
    isCallDisConnected(val) {
      setTimeout(() => {
        if (this.isCallDisConnected && this.isConferenceDisConnected) {
          router.push(this.isRegistered ? this.currentNav.path : LOGIN.LOGIN_CONTENT);
        }
      }, 3000);
    },
    isInMiniConference(val) {
      if (val) {
        router.push(this.currentNav.path);
      }
      else if (!this.isConferenceDisConnected) {
        router.push(CONFERENCE.CONFERENCE_MAIN);
      }
    },
    isInMiniCall(val) {
      if (val) {
        router.push(this.currentNav.path);
      }
      else if (!this.isCallDisConnected) {
        router.push(CALL.CALL_MAIN);
      }
    },
    currentSidebar(sidebar) {
      if (sidebar.currentPath) {
        router.push(sidebar.currentPath);
      }
    },
  },
});

export default model;
