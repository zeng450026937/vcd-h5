<template>
  <a-layout id="main-contact" class="h-full">
    <div class="flex h-full">
      <div v-if="!hideNav" class="flex flex-col h-full bg-under-painting">
        <main-nav class="w-nav-normal normal:w-nav-normal middle:w-nav-middle max:w-nav-max"/>
        <main-nav-mini-video v-if="showMiniVideo"/>
        <main-nav-mini-call v-if="showMiniCall"/>
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
import MainNav from '../../components/Main/MainNav.vue';
import MainNavMiniVideo from '../../components/Main/MainNavMiniVideo.vue';
import MainNavMiniCall from '../../components/Main/MainNavMiniCall.vue';
import { MAIN } from '../../router/constants';

export default {
  name       : 'MainContact',
  components : {
    MainNav,
    MainNavMiniVideo,
    MainNavMiniCall,
  },
  data() {
    return {
      hideNav : false,
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
      return this.$model.state.isInMiniCall
        && (this.callStatus === 'connected'
          || this.callStatus === 'connecting'
          || this.$rtc.call.status === 'confirmed');
    },
  },
  mounted() {
  },
  methods : {
  },
  watch : {
    $route : {
      handler(val) {
        this.hideNav = val.path === MAIN.CALENDAR_RESERVE;
      },
      immediate : true,
    },
  },
};
</script>
