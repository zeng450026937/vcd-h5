<template>
  <div id="layout-main" class="h-full flex">
    <router-view name="sidebar"/>

    <div class="h-full flex relative layout-main-content">

      <div class="nav-content normal:w-nav-normal middle:w-nav-middle max:w-nav-max">
        <router-view v-if="showNav" name="nav"/>
      </div>

      <router-view/>

      <div class="bg-under-painting mini-window-content absolute normal:w-nav-normal middle:w-nav-middle max:w-nav-max">
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
  #layout-main{
    .layout-main-content {
      width: calc(100% - 64px);
    }
    .mini-window-content {
      bottom: 0;
      left: 0;
    }
  }

</style>
