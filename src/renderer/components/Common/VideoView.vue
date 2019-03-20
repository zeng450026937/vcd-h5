<template>
  <a-layout id="video-view"
            class="overflow-hidden video-content-wrapper bg-media"
            :class="{[`${position} video-content-wrapper-${position}`]: true,
            'w-full h-full': position === 'absolute'}">
    <video
        :id="videoId"
        class="video-content"
        autoplay loop
        :muted="muted"
        v-once
        :style="{'object-fit': objectFit}"
        @click="videoClicked"
    ></video>
    <div v-show="!hideVideo"
         v-if="!videoStream"
         class="loading-notice absolute flex flex-col w-full justify-center items-center">
      <a-spin size="large"/>
      <div class="mt-2 text-indigo text-xl">视频加载中...</div>
    </div>
    <div v-show="hideVideo">
      <slot name="bg"/>
      <slot name="content"/>
    </div>
    <slot name="controls"/>
  </a-layout>
</template>

<script>
// TODO the code may mass , rebuild next year
export default {
  name  : 'VideoView',
  props : {
    source : {
      type    : String,
      default : 'local', // local remote screen
    },
    objectFit : {
      type    : String,
      default : 'contain',
    },
    position : {
      type    : String,
      default : 'absolute',
    },
    muted : {
      type    : Boolean,
      default : false,
    },
    hideVideo : {
      type    : Boolean,
      default : false,
    },
  },
  data() {
    return {
      videoElement : null,
    };
  },
  mounted() {
    this.initStream();
  },
  destroyed() {
    // if (this.videoStream) this.$rtc.media.localMedia.releaseStream();
    switch (this.source) {
      case 'local':
        this.$rtc.media.localMedia.releaseStream();
        break;
      case 'remote':
        break;
      case 'screen': break;
      default: break;
    }
  },
  computed : {
    videoId() {
      return `${this.source}-video-${Date.now()}`;
    },
    videoStream() {
      const streamMap = {
        local  : this.$rtc.media.localMedia.stream,
        remote : this.$rtc.conference.mediaChannel.remoteStream,
        screen : this.$rtc.conference.shareChannel.remoteStream
          || this.$rtc.conference.shareChannel.localStream,
      };

      return streamMap[this.source];
    },
  },
  methods : {
    videoClicked() {
      this.$emit('video-clicked');
    },
    onVideoStreamChanged(stream) {
      if (!stream) return;
      if (!this.videoElement) { // TODO update DOM to refs
        this.videoElement = document.getElementById(this.videoId);
      }
      if (this.videoElement && this.videoElement.srcObject !== stream) {
        this.videoElement.srcObject = stream;
        // this.videoElement.src = 'https://api.dogecloud.com/player/get.mp4?vcode=5ac682e6f8231991&userId=17&ext=.mp4';
      }
    },
    initStream() {
      if (this.videoStream && !this.videoElement) {
        this.onVideoStreamChanged(this.videoStream);
      }
      switch (this.source) {
        case 'local':
          this.$rtc.media.localMedia.acquireStream();
          break;
        case 'remote':
          break;
        case 'screen': break;
        default: break;
      }
    },
  },
  watch : {
    videoStream : {
      handler   : 'onVideoStreamChanged',
      immediate : true,
    },
    hideVideo(val) {
      if (val) { // 隐藏
        this.videoElement.style.display = 'none';
      }
      else {
        this.videoElement.style.display = 'block';
      }
    },
  },
};
</script>

<style scoped lang="less">
  .video-content-wrapper {
    &-absolute, .loading-notice {
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      .video-content {
        height: 100%;
      }
    }
    .video-content {
      width: 100%;
    }
  }
</style>
