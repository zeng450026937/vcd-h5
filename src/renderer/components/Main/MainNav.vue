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
    <navigation @nav-click="clickNav" :use-calendar="useSchedule" :navs="sidebar.navs"></navigation>

    <div class="flex h-full" v-if="searchText">
      <global-search/>
    </div>
    <div class="flex flex-grow"></div>
  </div>
</template>

<script>
import GlobalSearch from './GlobalSearch.vue';
import navigation from '../Common/navigation.vue';

export default {
  name       : 'MainNav',
  components : {
    GlobalSearch,
    navigation,
  },
  sketch : {
    ns    : 'main',
    props : [ 'searchText', 'currentNav' ],
  },
  data() {
    return {
      sidebar      : {},
      currentRoute : null,
      useSchedule  : false,
    };
  },
  created() {
    this.initNav();
  },
  methods : {
    initNav() {
      this.currentRoute = this.$router.currentRoute;
      this.useSchedule = this.currentRoute.name === 'schedule';

      this.sidebar = this.$model.main.currentSidebar;
      this.currentNav = this.sidebar.navs
        ? this.sidebar.navs.find((n) => n.path === this.currentRoute.path)
        : this.sidebar.currentPath;
    },
    clickNav(nav) {
      this.currentNav = nav;
    },

  },
  watch : {
    currentNav(val) {
      if (!val) return;

      this.sidebar.currentPath = this.currentNav.path;
      this.$router.push(this.sidebar.currentPath);
    },
    $route(val) {
      this.initNav();
    },
  },
};
</script>

<style scoped>
  #main-nav {
    min-width: 240px;
    max-width: 260px;
    width: 100%;
  }
</style>
