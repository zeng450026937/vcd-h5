<template>
  <a-layout id="main-nav" class="flex-col h-full select-none bg-white border-r">
    <div class="h-14">
      <div class="flex px-3 h-full items-center border-b">
        <a-input
            v-model="searchText"
            placeholder='搜索联系人'
        >
          <a-iconfont v-if="!searchText"
                      slot="suffix"
                      type="icon-sousuo"
                      class="text-base text-grey"/>
          <a-iconfont v-else
                      slot="suffix"
                      type="icon-guanbi"
                      class="text-base text-grey cursor-pointer hover:text-red"
                      @click="searchText = ''"/>
        </a-input>
      </div>
    </div>

    <div v-show="!searchText">
      <calendar-nav v-if="isInCalendar"/>
      <div v-else>
        <div v-for="(nav, index) in sidebar.navs"
             class="flex items-center h-12 px-4 cursor-pointer"
             :class="{'bg-list-select':currentNav === nav,
             'hover:bg-list-hover': currentNav !== nav}"
             :key="index"
             @click="clickNav(nav, index)">
          <a-iconfont :type="nav.icon" class="text-base text-indigo-dark"/>
          <span class="ml-3 text-sm">{{nav.text}}</span>
        </div>
      </div>
    </div>
    <div class="flex h-full" v-if="searchText">
      <global-search/>
    </div>
    <div class="flex flex-grow"></div>
  </a-layout>
</template>

<script>
import { MAIN, MODULE_NAME } from '../../router/constants';
import GlobalSearch from './GlobalSearch.vue';
import CalendarNav from './Calendar/CalendarNav.vue';

export default {
  name       : 'MainNav',
  components : {
    GlobalSearch,
    CalendarNav,
  },
  sketch : {
    ns    : 'main',
    props : [ 'searchText', 'currentNav' ],
  },
  data() {
    return {
      sidebar      : {},
      currentRoute : null,
      isInCalendar : false,
    };
  },
  computed : {
    sidebarMap() {
      return this.$model.main.sidebarMap;
    },
  },
  created() {
    this.initNav();
  },
  methods : {
    initNav() {
      this.currentRoute = this.$router.currentRoute;
      this.isInCalendar = this.currentRoute.meta.owner === MODULE_NAME.CALENDAR;
      // if (this.isInCalendar) return;

      const nav = this.currentRoute.meta.owner;

      this.sidebar = this.sidebarMap[nav];
      this.currentNav = this.sidebar.navs
        ? this.sidebar.navs.find((n) => n.route === this.currentRoute.path)
        : this.sidebar.currentRoute;
    },
    clickNav(nav, index) {
      this.currentNav = nav;
    },

  },
  watch : {
    currentNav(val) {
      this.sidebar.currentRoute = this.currentNav.route;
      this.$router.push(this.sidebar.currentRoute);
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
