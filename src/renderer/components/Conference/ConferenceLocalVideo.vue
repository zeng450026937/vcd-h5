<template>
  <div id="conference-local-video" class="relative group"
       :class="{[`conference-local-video-${videoLayouts[videoCursor]}`]: true}">
    <remote-video source="local" object-fit="cover" :class="{'opacity-0':videoCursor === 0}"/>
    <template v-if="videoCursor !== 2">
      <div class="video-mask group-hover:opacity-100"
           :class="{'opacity-0': videoCursor !== 0}"></div>
      <div class="video-controls group-hover:opacity-100"
           :class="{'opacity-0': videoCursor !== 0}">
        <div class="flex px-4" :class="{[`pt-${videoCursor === 0 ? 1 : 3}`]: true}">
          <a-icon v-if="videoCursor !== 0" type="fullscreen" class="text-xl text-white" @click="switchShrinkOrExpand"/>
          <a-icon type="down-square" class="text-xl text-white ml-4" @click="switchMaxOrMin"/>
        </div>
      </div>
      <div v-if="videoCursor === 0"
           class="video-title h-full flex items-center text-white mx-4">
        <span class="z-10 text-xs">本地视频</span>
      </div>
    </template>
  </div>
</template>

<script>
import RemoteVideo from '../Common/VideoView.vue';
import { CONFERENCE } from '../../router/constants';

export default {
  name       : 'ConferenceLocalVideo',
  components : {
    RemoteVideo,
  },
  data() {
    // FIXME may hard code
    const videoLayouts = [ 'min', 'shrink', 'normal', 'expand' ]; // normal occurred when drawer showed

    return {
      videoLayouts,
      videoCursor    : 1, // min shrink mini normal expand
      videoCursorPre : 1, // 右侧菜单拉出的时候记住当前本地视频的窗口状态
    };
  },
  methods : {
    // 变大或者变小
    switchShrinkOrExpand() {
      this.videoCursor = this.videoCursor === 1 ? 3 : 1;
    },
    // 最大或者最小
    switchMaxOrMin() {
      this.videoCursor = this.videoCursor === 0 ? 3 : 0;
    },
  },
  watch : {
    $route : {
      handler(val) {
        if (val.path === CONFERENCE.CONFERENCE_DRAWER) {
          this.videoCursorPre = this.videoCursor;
          this.videoCursor = 2;
        }
        else {
          this.videoCursor = this.videoCursorPre;
        }
      },
      immediate : true,
    },
  },
};
</script>

<style lang="less">
  #conference-local-video {
    border: 1px solid #1D212F;
    .video-mask {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      cursor: pointer;
      background-color: rgba(0,0,0,0.65);
    }
    .video-controls {
      position: absolute;
      top: 0;
      left: 100%;
      transform: translateX(-100%);
      cursor: pointer;
    }
  }
  .conference-local-video { // min shrink normal expand
    &-min {
      width: 176px;
      height: 32px;
    }
    &-shrink {
      width: 176px;
      height: 99px;
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
