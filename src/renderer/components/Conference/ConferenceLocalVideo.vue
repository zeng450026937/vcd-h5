<template>
  <div id="conference-local-video" class="relative group"
       :class="{[`conference-local-video-${videoLayouts[videoCursor]}`]: true}">
    <!--//TODO 如果添加该段消息提示代码，则会导致本地视频-->
    <div>
      <conference-message v-if="videoCursor !== 2" class="conference-message"/>
    </div>
    <video-view source="local"
                object-fit="cover"
                class="cursor-pointer"
                :class="{'opacity-0':videoCursor === 0}"/>
    <template v-if="videoCursor !== 2">
      <div class="video-controls group-hover:opacity-100 h-8"
           :class="{'opacity-0': videoCursor !== 0}">
        <div class="flex px-4 justify-end pt-2">
          <a-iconfont v-if="videoCursor !== 0"
                      :type="videoCursor === 1 ? 'icon-fangda' : 'icon-suoxiao'"
                      :title="videoCursor === 1 ? '放大' : '缩小'"
                      class="text-base text-white"
                      @click="switchShrinkOrExpand"/>
          <a-iconfont :type="videoCursor === 0 ? 'icon-zhankai' : 'icon-yincang'"
                      :title="videoCursor === 0 ? '展开' : '隐藏'"
                      class="text-base text-white ml-4"
                      @click="switchMaxOrMin"/>
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
import VideoView from '../Common/VideoView.vue';
import ConferenceMessage from './ConferenceMessage.vue';
import { CONFERENCE } from '../../router/constants';

export default {
  name       : 'ConferenceLocalVideo',
  components : {
    VideoView,
    ConferenceMessage,
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
      this.videoCursor = this.videoCursor === 0 ? 1 : 0;
    },
    // videoClicked() {
    //   this.$emit('video-clicked');
    // },
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
    .conference-message {
      position: absolute;
      width: 100%;
      text-align: right;
      color: white;
      transform: translateY(-100%);
    }
  }
  .conference-local-video { // min shrink normal expand
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
