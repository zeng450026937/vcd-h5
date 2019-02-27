<template>
  <a-layout id="main-contact" class="h-full">
    <div class="flex h-full">
      <div v-if="!hideNav" class="flex flex-col h-full bg-grey-lighter">
        <component style="width: 240px;" :is="currentNav"/>
        <main-nav-mini-video v-if="showMiniVideo" style="width: 240px;"/>
        <main-nav-mini-call v-if="showMiniCall" style="width: 240px;"/>
      </div>
      <div class="flex h-full bg-white"
            :style="{
              width: hideNav ? '100%' : 'calc( 100% - 240px )'
            }">
        <router-view/>
      </div>
    </div>
  </a-layout>
</template>

<script>
import MainNav from '../components/Main/MainNav.vue';
import CalendarNav from '../components/Main/Calendar/CalendarNav.vue';
import MainNavMiniVideo from '../components/Main/MainNavMiniVideo.vue';
import MainNavMiniCall from '../components/Main/MainNavMiniCall.vue';
import { MODULE_NAME, MAIN } from '../router/constants';

export default {
  name       : 'MainContact',
  components : {
    MainNav,
    MainNavMiniVideo,
    MainNavMiniCall,
  },
  data() {
    return {
      currentNav : MainNav,
      hideNav    : false,
    };
  },
  computed : {
    confStatus() {
      return this.$model.state.confStatus;
    },
    callStatus() {
      return this.$model.state.callStatus;
    },
    showMiniVideo() {
      return this.$model.state.isInMiniConference && this.confStatus === 'connected';
    },
    showMiniCall() {
      return this.$model.state.isInMiniCall && (this.callStatus === 'connected' || this.callStatus === 'connecting');
    },
  },
  mounted() {
  },
  watch : {
    $route : {
      handler(val) {
        this.currentNav = val.meta.owner === MODULE_NAME.CALENDAR ? CalendarNav : MainNav;
        this.hideNav = val.path === MAIN.CALENDAR_RESERVE;
      },
      immediate : true,
    },
  },
};
</script>

<style scoped>

</style>
