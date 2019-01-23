<template>
  <a-layout id="meeting-nav" class="flex-col h-full select-none bg-white border-r">
    <div class="flex px-3 items-center h-14 border-b">
      <div class="w-full">
        <a-input
            v-model="searchText"
            placeholder='搜索联系人'
        >
          <a-icon slot="suffix" type='search' class="text-lg text-grey"/>
        </a-input>
      </div>
    </div>
    <div class="flex items-center h-12 px-4 cursor-pointer"
         :class="{'mt-0': nav.isTop,
         'bg-grey-light':currentNav === index,
         'hover:bg-grey-lighter': currentNav !== index}"
         v-for="(nav, index) in navs"
         :key="index" @click="clickNav(nav, index)">
      <a-icon :type="nav.icon" class="text-base text-indigo-dark"/>
      <span class="ml-3 text-sm">{{nav.text}}</span>
    </div>
  </a-layout>
</template>

<script>
export default {
  name  : 'MainNav',
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
  created() {
    this.initNav();
  },
  methods : {
    initNav() {
      this.currentRoute = this.currentRoute || this.$router.currentRoute;
      const nav = this.currentRoute.path.split('/')[2];

      switch (nav) {
        case 'meeting':
          this.navs = [
            { icon: 'plus-square', route: 'instance', text: '即时会议', isTop: true },
            { icon: 'export', route: 'enter', text: '加入会议' },
            { icon: 'profile', route: 'record', text: '通话记录' },
            { icon: 'phone', route: 'dial', text: '拨号' },
          ];
          break;
        case 'contact':
          this.navs = [
            { icon: 'solution', route: 'corporate', text: '企业联系人', bg: 'blue', isTop: true },
            { icon: 'star', route: 'frequent', text: '常用联系人', bg: 'yellow-dark' },
            { icon: 'environment', route: 'local', text: '本地联系人', bg: 'teal' },
          ];
          break;
        case 'file':
          this.navs = [
            { icon: 'folder', route: 'recent', text: '最近录制文件', isTop: true },
            { icon: 'hdd', route: 'local', text: '本地录制文件' },
            { icon: 'cloud', route: 'remote', text: '云录制文件' },
          ];
          break;
        case 'setting':
          this.navs = [
            { icon: 'idcard', route: 'account', text: '个人资料', isTop: true },
            { icon: 'appstore', route: 'common', text: '通用' },
            { icon: 'team', route: 'conference', text: '会议' },
            { icon: 'phone', route: 'audio', text: '音频' },
            { icon: 'video-camera', route: 'video', text: '视频' },
            { icon: 'info-circle', route: 'about', text: '关于' },
          ];
          break;
        default: break;
      }
    },
    clickNav(nav, index) {
      this.currentNav = index;
    },

  },
  watch : {
    currentNav : {
      handler(val) {
        console.warn(this.currentRoute);
        if (!this.currentRoute) return;
        this.$router.push(`${this.currentRoute.path}/${this.navs[val].route}`);
      },
      immediate : true,
    },
  },
};
</script>

<style scoped>
</style>
