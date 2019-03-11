<template>
  <a-layout id="meeting-nav" class="flex-col h-full select-none bg-white border-r">
    <div class="flex px-3 items-center h-14 border-b">
      <div class="w-full">
        <a-input
            v-model="searchText"
            placeholder='搜索联系人'
        >
          <a-iconfont slot="suffix" type='icon-sousuo' class="text-lg text-grey"/>
        </a-input>
      </div>
    </div>
    <div class="flex items-center h-12 px-4 cursor-pointer"
         :class="{'mt-0': nav.isTop,
         'bg-list-select':currentNav === index,
         'hover:bg-list-hover': currentNav !== index}"
         v-for="(nav, index) in navs"
         :key="index" @click="clickNav(nav, index)">
      <a-iconfont :type="nav.icon" class="text-base text-indigo-dark"/>
      <span class="ml-3 text-sm">{{nav.text}}</span>
    </div>
    <div class="flex flex-grow"></div>
  </a-layout>
</template>

<script>

// FIXME the currentNav should be set by route
import { MAIN } from '../../router/constants';

export default {
  name       : 'MainNav',
  components : {
  },
  props : {
  },
  data() {
    return {
      navs         : [],
      searchText   : '',
      currentNav   : 0,
      currentRoute : null,
    };
  },
  computed : {
    isCloud() {
      return this.$model.login.serverType === 'cloud';
    },
  },
  created() {
    this.initNav();
  },
  methods : {
    initNav() {
      this.currentNav = 0;
      this.currentRoute = this.$router.currentRoute;
      const nav = this.currentRoute.meta.owner;

      switch (nav) {
        case 'meeting':
          this.navs = [
            { icon: 'icon-jishihuiyi', route: MAIN.MEETING_INSTANCE, text: '即时会议', isTop: true },
            { icon: 'icon-jiaruhuiyi', route: MAIN.MEETING_ENTER, text: '加入会议' },
            { icon: 'icon-tonghuajilu', route: MAIN.CALL_RECORD, text: '通话记录' },
            { icon: 'icon-bohao', route: MAIN.DIAL_PLATE, text: '拨号' },
          ];
          break;
        case 'contact':
          this.navs = [
            { icon: 'icon-qiyelianxiren', route: MAIN.CONTACT_CORPORATE, text: '企业联系人', isTop: true },
            { icon: 'icon-bendilianxiren', route: MAIN.CONTACT_LOCAL, text: '本地联系人' },
          ];
          if (!this.isCloud) {
            this.navs.splice(1, 0, { icon: 'icon-changyonglianxiren', route: MAIN.CONTACT_FREQUENT, text: '常用联系人' });
          }
          break;
        case 'setting':
          this.navs = [
            { icon: 'icon-gerenziliao', route: MAIN.SETTING_ACCOUNT, text: '个人资料', isTop: true },
            { icon: 'icon-tongyong', route: MAIN.SETTING_COMMON, text: '通用' },
            { icon: 'icon-huiyishi', route: MAIN.SETTING_CONFERENCE, text: '会议' },
            { icon: 'icon-maikefeng', route: MAIN.SETTING_AUDIO, text: '音频' },
            { icon: 'icon-shexiangtou', route: MAIN.SETTING_VIDEO, text: '视频' },
            { icon: 'icon-guanyu', route: MAIN.ABOUT_US, text: '关于' },
          ];
          break;
        default: break;
      }
      this.currentNav = this.navs.findIndex((n) => n.route === this.currentRoute.path);
    },
    clickNav(nav, index) {
      this.currentNav = index;
    },

  },
  watch : {
    currentNav : {
      handler(val) {
        if (!this.currentRoute) return;
        this.$router.push(this.navs[val].route);
      },
      immediate : true,
    },
    $route(val) {
      if (val.meta.owner !== this.currentRoute.meta.owner) {
        this.initNav();
      }
    },
  },
};
</script>

<style scoped>
</style>
