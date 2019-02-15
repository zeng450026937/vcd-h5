<template>
  <a-layout id="call-controls" class="mb-5 bg-transparent">
    <div class="button-content flex h-12 items-center justify-center z-10">
      <!--视频-->
      <!--<a-button v-if="callStatus === 'connected'"-->
                <!--shape="circle"-->
                <!--class="control-btn w-12 h-12 text-xl text-white mx-2"-->
      <!--&gt;-->
        <!--<a-iconfont type="icon-shexiangtou"/>-->
      <!--</a-button>-->
      <!--音频-->
      <a-button shape="circle"
                class="control-btn w-12 h-12 text-2xl text-white mx-2 border-transparent"
      >
        <a-iconfont type="icon-maikefeng"/>
      </a-button>
      <!--辅流-->
      <!--<a-button v-if="callStatus === 'connected'"-->
                <!--shape="circle"-->
                <!--class="control-btn w-12 h-12 text-xl text-white mx-2"-->
      <!--&gt;-->
        <!--<a-iconfont type="icon-fuliu"/>-->
      <!--</a-button>-->
      <!--更多-->
      <a-button shape="circle"
                class="control-btn w-12 h-12 text-2xl text-white mx-2 border-transparent"
      >
        <a-iconfont type="icon-gengduo"/>
      </a-button>
      <!--挂断-->
      <a-button shape="circle"
                class="control-btn w-12 h-12 text-2xl text-white mx-2 bg-red-light border-transparent"
                @click="hangUp"
      >
        <a-iconfont type="icon-guaduan"/>
      </a-button>
    </div>
  </a-layout>
</template>

<script>
export default {
  name     : 'CallControls',
  computed : {
    callStatus() {
      return this.$model.state.callStatus;
    },
  },
  methods : {
    hangUp() {
      if (this.callStatus === 'ringing') {
        this.$rtc.call.decline().catch(() => {});
      }
      else {
        this.$rtc.call.disconnect();
      }
    },
  },
};
</script>

<style lang="less">
  #call-controls {
    .control-btn {
      background: rgba(0,0,0,0.65);
    }
  }
</style>
