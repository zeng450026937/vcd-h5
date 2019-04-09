<template>
  <div id="call-local-video" class="relative group"
       :class="{[`call-local-video-${videoLayouts[current]}`]: true}">
    <video-view source="local"
                object-fit="cover"
                muted
                class="cursor-pointer"
                :class="{'opacity-0':current === 0}"/>
    <template v-if="current !== 2">
      <div class="video-controls group-hover:opacity-100 h-8"
           :class="{'opacity-0': current !== 0}">
        <div class="flex px-4 justify-end pt-2">
          <a-iconfont v-if="current !== 0"
                      :type="current === 1 ? 'icon-fangda' : 'icon-suoxiao'"
                      :title="current === 1 ? '放大' : '缩小'"
                      class="text-base text-white"
                      @click="switchShrinkOrExpand"/>
          <a-iconfont :type="current === 0 ? 'icon-zhankai' : 'icon-yincang'"
                      :title="current === 0 ? '展开' : '隐藏'"
                      class="text-base text-white ml-4"
                      @click="switchMaxOrMin"/>
        </div>
      </div>
      <div v-if="current === 0"
           class="video-title h-full flex items-center text-white mx-4">
        <span class="z-10 text-xs">本地视频</span>
      </div>
    </template>
  </div>
</template>

<script>
import VideoView from '../Common/VideoView.vue';

export default {
  name       : 'CallLocalVideo',
  components : {
    VideoView,
  },
  data() {
    // FIXME may hard code
    const videoLayouts = [ 'min', 'shrink', 'normal', 'expand' ]; // normal occurred when drawer showed

    return {
      videoLayouts,
    };
  },
  sketch : {
    ns    : 'call.sketch',
    props : [ 'localWindowState', 'isInCallMain' ],
  },
  computed : {
    current() {
      return this.localWindowState.current;
    },
    isConnected() {
      return this.$rtc.call.connected;
    },
  },
  methods : {
    // 变大或者变小
    switchShrinkOrExpand() {
      this.localWindowState.current = this.current === 1 ? 3 : 1;
    },
    // 最大或者最小
    switchMaxOrMin() {
      this.localWindowState.current = this.current === 0 ? 1 : 0;
    },
  },
  watch : {
    isInCallMain(val) {
      if (val) {
        this.localWindowState.current = this.localWindowState.pre;
      }
      else {
        this.localWindowState.pre = this.current;
        this.localWindowState.current = 2;
      }
    },
    // isConnected : {
    //   handler(val) {
    //     if (val) {
    //       this.$rtc.call.channel.replaceLocalStream(this.$model.conference.staticStream);
    //     }
    //   },
    //   immediate : true,
    // },
  },
};
</script>

<style lang="less">
  #call-local-video {
    border: 1px solid #1D212F;
    .video-controls {
      position: absolute;
      top: 0;
      left: 100%;
      cursor: pointer;
      width: 100%;
      transform: translateX(-100%);
      background: rgba(0,0,0,0.65);
      transition: opacity ease-in-out .5s;
    }
  }
  .call-local-video { // min shrink normal expand
    &-min {
      width: 176px;
      height: 32px;
    }
    &-shrink {
      width: 176px;
      height: 98px;
    }
    &-normal {
      width: 280px;
      height: 158px;
    }
    &-expand {
      width: 352px;
      height: 198px;
    }
  }
</style>
