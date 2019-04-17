<template>
  <div id="conference-local-video" class="relative group"
       :class="{[`conference-local-video-${videoLayouts[current]}`]: true}">
    <!--//TODO 如果添加该段消息提示代码，则会导致本地视频-->
    <div :class="{'message-bottom': !isVideoConference}">
      <conference-message v-if="current !== 2 && isVideoConference" class="conference-message"/>
    </div>
    <video-view v-show="isVideoConference"
                source="local"
                muted
                object-fit="cover"
                class="cursor-pointer"
                :hide-video="isVideoBlock"
                :class="{'opacity-0':current === 0}"/>
    <div v-if="isVideoBlock && current !== 0"
         class="flex h-full items-center justify-center bg-main-theme"
         slot="content">
      <a-iconfont type="icon-shipinjinyong" class="display-icon"/>
    </div>
    <template v-if="current !== 2 && isVideoConference">
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
import ConferenceMessage from './ConferenceMessage.vue';

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
    };
  },
  sketch : {
    ns    : 'conference.sketch',
    props : [ 'localWindowState', 'isInConferenceMain', 'isVideoConference' ],
  },
  computed : {
    current() {
      return this.localWindowState.current;
    },
    isVideoBlock() {
      return this.$model.conference.videoStatus === 'block';
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
    isInConferenceMain(val) {
      if (val) {
        this.localWindowState.current = this.localWindowState.pre;
      }
      else {
        this.localWindowState.pre = this.current;
        this.localWindowState.current = 2;
      }
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
    .message-bottom{
      bottom: 0;
      position: absolute;
      width: 100%;
    }
    .conference-message {
      position: absolute;
      width: 100%;
      text-align: right;
      color: white;
      transform: translateY(-100%);
    }
    .display-icon {
      opacity: 0.4;
      color: white;
      font-size: 36px;
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
