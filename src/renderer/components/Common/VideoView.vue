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
    <div v-if="!videoStream && !hideVideo"
         class="loading-notice">
      <a-spin size="large"/>
      <div class="mt-2 text-indigo text-xl">视频加载中...</div>
    </div>
    <template v-show="hideVideo">
      <slot name="content"/>
    </template>
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
      default : 'local', // local remote screen call-remote
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
        'call-remote' : this.$rtc.call.remoteStream,
      };

      return streamMap[this.source];
    },
  },
  methods : {
    videoClicked() {
      this.$emit('video-clicked');
    },
    async onVideoStreamChanged(stream) {
      if (!stream) return;
      await this.$nextTick();
      if (!this.videoElement) { // TODO update DOM to refs
        this.videoElement = document.getElementById(this.videoId);
      }
      if (this.hideVideo) {
        this.videoElement.style.display = 'none';

        return;
      }
      if (this.videoElement && this.videoElement.srcObject !== stream) {
        this.videoElement.srcObject = stream;
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
    hideVideo : {
      async handler(val) {
        await this.$nextTick();
        if (this.videoElement) {
          if (val) { // 隐藏
            this.videoElement.style.display = 'none';
          }
          else {
            this.onVideoStreamChanged(this.videoStream);
            this.videoElement.style.display = 'block';
          }
        }
      },
      immediate : true,
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
    .loading-notice {
      @apply absolute flex flex-col w-full justify-center items-center;
    }
    .video-content {
      width: 100%;
    }
  }
</style>
