<template>
  <div id="main-nav" class="flex-col h-full select-none bg-white border-r">
    <div class="h-14">
      <div class="flex px-3 h-full items-center border-b">
        <a-input
            v-model="searchText"
            placeholder='搜索联系人'
        >
          <a-iconfont v-if="!searchText"
                      slot="suffix"
                      type="icon-sousuo"
                      class="text-base text-grey"></a-iconfont>
          <a-iconfont v-else
                      slot="suffix"
                      type="icon-guanbi"
                      class="text-base text-grey cursor-pointer hover:text-red"
                      @click="searchText = ''"></a-iconfont>
        </a-input>
      </div>
    </div>

    <div v-show="!searchText">
      <!--拆分-->
      <calendar-nav v-if="isInCalendar"/>
      <div v-else>
        <div v-for="(nav, index) in sidebar.navs"
             class="flex items-center h-12 px-4 cursor-pointer"
             :class="{'bg-list-select':currentNav === nav,
             'hover:bg-list-hover': currentNav !== nav}"
             :key="index"
             @click="clickNav(nav, index)">
          <a-iconfont :type="nav.icon" class="text-base text-indigo-dark"></a-iconfont>
          <span class="ml-3 text-sm">{{nav.text}}</span>
        </div>
      </div>
    </div>
    <div class="flex h-full" v-if="searchText">
      <global-search/>
    </div>
    <div class="flex flex-grow"></div>
  </div>
</template>

<script>
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
    }
  },
  created() {
    this.initNav();
  },
  methods : {
    initNav() {
      this.currentRoute = this.$router.currentRoute;
      this.isInCalendar = this.currentRoute.name === 'calendar';

      this.sidebar = this.$model.main.currentSidebar;
      this.currentNav = this.sidebar.navs
        ? this.sidebar.navs.find((n) => n.path === this.currentRoute.path)
        : this.sidebar.currentRoute;
    },
    clickNav(nav, index) {
      this.currentNav = nav;
    },

  },
  watch : {
    currentNav(val) {
      if (!val) return;

      this.sidebar.currentRoute = this.currentNav.path;
      this.$router.push(this.sidebar.currentRoute);
    },
    $route(val) {
      this.initNav();
    },
  },
  // beforeRouteUpdate(to, from, next) {
  //   console.warn('update')
  //   this.initNav();
  //   next();
  // },
};
</script>

<style scoped>
  #main-nav {
    min-width: 240px;
    max-width: 260px;
    width: 100%;
  }
</style>
