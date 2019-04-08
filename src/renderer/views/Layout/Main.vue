<template>
  <div id="layout-main" class="h-full flex">
    <router-view name="sidebar"/>
    <div class="w-full h-full flex relative">
      <router-view v-if="showNav" name="nav"/>
      <router-view/>
      <div class="flex flex-col bg-under-painting mini-window-content absolute">
        <main-nav-mini-video v-if="showMiniVideo"/>
        <main-nav-mini-call v-if="showMiniCall"/>
      </div>
    </div>

  </div>
</template>

<script>
import MainNavMiniVideo from '../../components/Main/MainNavMiniVideo.vue';
import MainNavMiniCall from '../../components/Main/MainNavMiniCall.vue';

export default {
  name       : 'LayoutMain',
  components : {
    MainNavMiniVideo,
    MainNavMiniCall,
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
  data() {
    return {
      showNav : true,
    };
  },
  watch : {
    $route : {
      handler(val) {
        this.showNav = val.name !== 'reservation';
      },
      immediate : true,
    },
  },
};
</script>
<style lang="less">
  .mini-window-content {
    bottom: 0;
    left: 0;
  }
</style>
